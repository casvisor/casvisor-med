package bpmnpath

import (
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"regexp"
	"strconv"
	"strings"
	"time"
)

// 定义 BPMN 的结构体
type Definitions struct {
	XMLName   xml.Name  `xml:"definitions"`
	Processes []Process `xml:"process"`
}

type Process struct {
	XMLName      xml.Name      `xml:"process"`
	ID           string        `xml:"id,attr"`
	Name         string        `xml:"name,attr,omitempty"`
	FlowElements []FlowElement `xml:",any"`
}

type Task struct {
	XMLName xml.Name `xml:"task"`
	ID      string   `xml:"id,attr"`
	Name    string   `xml:"name,attr"`
}

type FlowElement struct {
	XMLName   xml.Name
	ID        string `xml:"id,attr"`
	Name      string `xml:"name,attr,omitempty"`
	SourceRef string `xml:"sourceRef,attr,omitempty"` // 明确解析 sourceRef
	TargetRef string `xml:"targetRef,attr,omitempty"` // 明确解析 targetRef
}

type SequenceFlow struct {
	XMLName             xml.Name `xml:"sequenceFlow"`
	ID                  string   `xml:"id,attr"`
	SourceRef           string   `xml:"sourceRef,attr"`
	TargetRef           string   `xml:"targetRef,attr"`
	ConditionExpression string   `xml:"conditionExpression,omitempty"`
}

type PathNode struct {
	Task           Task
	Next           []*PathNode
	Concurrent     []*PathNode
	IsMandatory    bool
	Delay          int
	ActualExecTime time.Time
}

func NewPathNode(task Task, isMandatory bool, delay int) *PathNode {
	return &PathNode{
		Task:        task,
		IsMandatory: isMandatory,
		Next:        []*PathNode{},
		Concurrent:  []*PathNode{},
		Delay:       delay,
	}
}

func (pn *PathNode) AddNext(next *PathNode) {
	pn.Next = append(pn.Next, next)
}

func (pn *PathNode) AddConcurrent(concurrent *PathNode) {
	pn.Concurrent = append(pn.Concurrent, concurrent)
}

func PathToString(node *PathNode, indent string) string {
	if node == nil {
		return ""
	}

	var sb strings.Builder

	sb.WriteString(fmt.Sprintf("%sTask: %s (Name: %s, Delay: %d days, Executed at: %v)\n", indent, node.Task.ID, node.Task.Name, node.Delay, node.ActualExecTime))

	indent += "    "

	// 处理并行任务
	if len(node.Concurrent) > 0 {
		for _, concurrent := range node.Concurrent {
			sb.WriteString(fmt.Sprintf("%sConcurrent Task:\n", indent))
			sb.WriteString(PathToString(concurrent, indent+"    "))
		}
	}

	// 处理顺序任务
	for _, next := range node.Next {
		sb.WriteString(PathToString(next, indent))
	}
	return sb.String()
}

func ExecutePath(node *PathNode) {
	if node == nil {
		return
	}

	node.ActualExecTime = time.Now()
	fmt.Printf("Executing task: %s at %v\n", node.Task.Name, node.ActualExecTime)

	if node.Delay > 0 {
		fmt.Printf("Waiting for %d days...\n", node.Delay)
		time.Sleep(time.Duration(node.Delay) * 24 * time.Hour)
	}

	// 执行并行任务
	for _, concurrent := range node.Concurrent {
		go ExecutePath(concurrent) // 并发执行并行任务
	}

	// 顺序执行后续任务
	for _, next := range node.Next {
		ExecutePath(next)
	}
}

func ParseBPMN(bpmnFilePath string) (map[string]Task, map[string][]SequenceFlow, map[string]bool, map[string]bool, map[string]int, []string, error) {
	file, err := ioutil.ReadFile(bpmnFilePath)
	if err != nil {
		return nil, nil, nil, nil, nil, nil, fmt.Errorf("Error reading BPMN file: %v", err)
	}

	var definitions Definitions
	err = xml.Unmarshal(file, &definitions)
	if err != nil {
		return nil, nil, nil, nil, nil, nil, fmt.Errorf("Error parsing BPMN file: %v", err)
	}

	tasks := map[string]Task{}
	sequenceFlows := map[string][]SequenceFlow{}
	exclusiveGateways := map[string]bool{}
	parallelGateways := map[string]bool{}
	timerEvents := map[string]int{}
	startEvents := []string{}

	for _, process := range definitions.Processes {
		for _, flowElement := range process.FlowElements {
			switch flowElement.XMLName.Local {
			case "task":
				tasks[flowElement.ID] = Task{ID: flowElement.ID, Name: flowElement.Name}
			case "startEvent", "endEvent", "intermediateCatchEvent", "intermediateThrowEvent":
				// 为事件节点添加默认名称
				defaultName := "Event"
				if flowElement.Name != "" {
					defaultName = flowElement.Name
				}
				tasks[flowElement.ID] = Task{ID: flowElement.ID, Name: defaultName}
				if flowElement.XMLName.Local == "startEvent" {
					startEvents = append(startEvents, flowElement.ID)
				}
			case "sequenceFlow":
				sourceRef := flowElement.SourceRef
				targetRef := flowElement.TargetRef
				seqFlow := SequenceFlow{
					ID:                  flowElement.ID,
					SourceRef:           sourceRef,
					TargetRef:           targetRef,
					ConditionExpression: flowElement.Name,
				}
				sequenceFlows[sourceRef] = append(sequenceFlows[sourceRef], seqFlow)
			case "exclusiveGateway", "parallelGateway":
				// 将网关加入到任务列表中
				tasks[flowElement.ID] = Task{ID: flowElement.ID, Name: flowElement.XMLName.Local}
				if flowElement.XMLName.Local == "exclusiveGateway" {
					exclusiveGateways[flowElement.ID] = true
				} else if flowElement.XMLName.Local == "parallelGateway" {
					parallelGateways[flowElement.ID] = true
				}
			case "timerEventDefinition":
				var days int
				fmt.Sscanf(flowElement.Name, "P%dD", &days)
				timerEvents[flowElement.ID] = days
			}
		}
	}

	return tasks, sequenceFlows, exclusiveGateways, parallelGateways, timerEvents, startEvents, nil
}

func evaluateCondition(condition string, variables map[string]float64) bool {
	condition = strings.ReplaceAll(condition, "&lt;", "<")
	condition = strings.ReplaceAll(condition, "&gt;", ">")
	condition = strings.ReplaceAll(condition, "&amp;&amp;", "&&")
	condition = strings.ReplaceAll(condition, "${", "")
	condition = strings.ReplaceAll(condition, "}", "")

	re := regexp.MustCompile(`([a-zA-Z_]+)\s*([<>=!]+)\s*([a-zA-Z0-9._]+)`)
	matches := re.FindAllStringSubmatch(condition, -1)

	for _, match := range matches {
		varName := match[1]
		operator := match[2]
		thresholdStr := match[3]

		var threshold float64
		if val, ok := variables[thresholdStr]; ok {
			threshold = val
		} else {
			parsedThreshold, err := strconv.ParseFloat(thresholdStr, 64)
			if err != nil {
				return false
			}
			threshold = parsedThreshold
		}

		actualValue, exists := variables[varName]
		if !exists {
			//fmt.Printf("Variable %s not found in provided data.\n", varName)
			return false
		}

		switch operator {
		case "<":
			if !(actualValue < threshold) {
				return false
			}
		case ">":
			if !(actualValue > threshold) {
				return false
			}
		case "==":
			if !(actualValue == threshold) {
				return false
			}
		case "<=":
			if !(actualValue <= threshold) {
				return false
			}
		case ">=":
			if !(actualValue >= threshold) {
				return false
			}
		case "!=":
			if !(actualValue != threshold) {
				return false
			}
		}
	}

	return true
}

func buildPaths(currentTask string, tasks map[string]Task, sequenceFlows map[string][]SequenceFlow, exclusiveGateways map[string]bool, parallelGateways map[string]bool, timerEvents map[string]int, variables map[string]float64) []*PathNode {
	visited := make(map[string]bool)
	return buildPathsHelper(currentTask, tasks, sequenceFlows, exclusiveGateways, parallelGateways, timerEvents, variables, visited)
}

func buildPathsHelper(currentTask string, tasks map[string]Task, sequenceFlows map[string][]SequenceFlow, exclusiveGateways map[string]bool, parallelGateways map[string]bool, timerEvents map[string]int, variables map[string]float64, visited map[string]bool) []*PathNode {
	if visited[currentTask] {
		//fmt.Printf("Task %s already visited, skipping to avoid loop\n", currentTask)
		return nil
	}

	visited[currentTask] = true
	task, exists := tasks[currentTask]
	if !exists {
		//fmt.Printf("Task %s not found in task list\n", currentTask)
		return nil
	}

	//fmt.Printf("Building paths for task: %s (Name: %s)\n", task.ID, task.Name)

	delay := timerEvents[currentTask]
	currentNode := NewPathNode(task, true, delay)

	nextFlows, hasNext := sequenceFlows[currentTask]
	if !hasNext {
		//fmt.Printf("No outgoing sequence flows for task %s\n", task.Name)
		return []*PathNode{currentNode}
	}

	var allPaths []*PathNode

	if _, isExclusiveGateway := exclusiveGateways[currentTask]; isExclusiveGateway {
		//fmt.Printf("Evaluating exclusive gateway for task: %s (Name: %s)\n", task.ID, task.Name)
		for _, flow := range nextFlows {
			//	fmt.Printf("Evaluating condition: %s for flow to %s\n", flow.ConditionExpression, flow.TargetRef)
			if evaluateCondition(flow.ConditionExpression, variables) {
				//		fmt.Printf("Condition met, choosing path to %s (Condition: %s)\n", flow.TargetRef, flow.ConditionExpression)
				newVisited := make(map[string]bool) // 每条路径使用全新的 visited
				newPath := buildPathsHelper(flow.TargetRef, tasks, sequenceFlows, exclusiveGateways, parallelGateways, timerEvents, variables, newVisited)
				for _, path := range newPath {
					pathWithStart := NewPathNode(task, true, delay)
					pathWithStart.AddNext(path)
					allPaths = append(allPaths, pathWithStart)
				}
			} else {
				//		fmt.Printf("Condition not met: %s (Condition: %s)\n", flow.TargetRef, flow.ConditionExpression)
			}
		}
	} else if _, isParallelGateway := parallelGateways[currentTask]; isParallelGateway {
		//fmt.Printf("Evaluating parallel gateway for task: %s (Name: %s)\n", task.ID, task.Name)
		var concurrentPaths []*PathNode
		for _, flow := range nextFlows {
			nextNode := buildPathsHelper(flow.TargetRef, tasks, sequenceFlows, exclusiveGateways, parallelGateways, timerEvents, variables, visited)
			if len(nextNode) > 0 {
				concurrentPaths = append(concurrentPaths, nextNode...)
			}
		}
		currentNode.Concurrent = concurrentPaths
		allPaths = append(allPaths, currentNode)
	} else {
		//fmt.Printf("Following sequence flow for task: %s (Name: %s)\n", task.ID, task.Name)
		for _, flow := range nextFlows {
			nextNodes := buildPathsHelper(flow.TargetRef, tasks, sequenceFlows, exclusiveGateways, parallelGateways, timerEvents, variables, visited)
			for _, nextNode := range nextNodes {
				currentNode.AddNext(nextNode)
			}
		}
		allPaths = append(allPaths, currentNode)
	}

	return allPaths
}

func ComparePaths(standardPath, actualPath *PathNode, variance *int, mandatoryTasks map[string]bool) {
	if standardPath == nil || actualPath == nil {
		return
	}

	// 1. 检查任务名称和任务 ID 是否匹配
	if standardPath.Task.Name != actualPath.Task.Name && mandatoryTasks[standardPath.Task.ID] {
		fmt.Printf("Variance detected: Task %s does not match actual task %s\n", standardPath.Task.Name, actualPath.Task.Name)
		*variance++
	}

	if standardPath.Task.ID != actualPath.Task.ID && mandatoryTasks[standardPath.Task.ID] {
		fmt.Printf("Variance detected: Task ID %s does not match actual task ID %s\n", standardPath.Task.ID, actualPath.Task.ID)
		*variance++
	}

	// 2. 检查任务执行时间
	if !actualPath.ActualExecTime.IsZero() {
		if standardPath.Delay > 0 {
			expectedExecTime := standardPath.ActualExecTime.Add(time.Duration(standardPath.Delay) * 24 * time.Hour)
			if actualPath.ActualExecTime.Before(expectedExecTime) {
				fmt.Printf("Variance: Task %s executed too early\n", actualPath.Task.Name)
				*variance++
			} else if actualPath.ActualExecTime.After(expectedExecTime) {
				fmt.Printf("Variance: Task %s executed too late\n", actualPath.Task.Name)
				*variance++
			}
		} else if actualPath.ActualExecTime.After(standardPath.ActualExecTime) {
			fmt.Printf("Variance: Task %s executed later than expected\n", actualPath.Task.Name)
			*variance++
		}
	}

	// 3. 顺序任务比较: 遍历标准路径和实际路径中的顺序任务
	standardNext := map[string]bool{}
	actualTasks := map[string]bool{}

	for _, next := range standardPath.Next {
		standardNext[next.Task.Name] = true
	}

	for _, next := range actualPath.Next {
		actualTasks[next.Task.Name] = true

		// 如果实际路径中存在标准路径中没有的顺序任务
		if !standardNext[next.Task.Name] && mandatoryTasks[next.Task.ID] {
			fmt.Printf("Variance: Actual task %s is not in standard path\n", next.Task.Name)
			*variance++
		}
	}

	// 检查标准路径中的必做任务是否缺失
	for _, next := range standardPath.Next {
		if mandatoryTasks[next.Task.ID] && !actualTasks[next.Task.Name] {
			fmt.Printf("Variance: Missing task %s in actual path\n", next.Task.Name)
			*variance++
		}
	}

	// 递归比较顺序任务
	for i := 0; i < len(standardPath.Next) && i < len(actualPath.Next); i++ {
		ComparePaths(standardPath.Next[i], actualPath.Next[i], variance, mandatoryTasks)
	}

	// 4. 并行任务比较: 对比标准路径和实际路径中的并行任务
	if len(standardPath.Concurrent) != len(actualPath.Concurrent) {
		fmt.Printf("Variance: Number of concurrent tasks do not match (expected %d, found %d)\n", len(standardPath.Concurrent), len(actualPath.Concurrent))
		*variance++
	} else {
		for i := 0; i < len(standardPath.Concurrent) && i < len(actualPath.Concurrent); i++ {
			ComparePaths(standardPath.Concurrent[i], actualPath.Concurrent[i], variance, mandatoryTasks)
		}
	}

	// 处理实际路径中多余的并行任务
	if len(actualPath.Concurrent) > len(standardPath.Concurrent) {
		for _, concurrent := range actualPath.Concurrent[len(standardPath.Concurrent):] {
			fmt.Printf("Variance: Extra concurrent task %s in actual path\n", concurrent.Task.Name)
			*variance++
		}
	}
}

// 出径检查
func IsDischarged(actualPath *PathNode) bool {
	return actualPath.Task.Name == "Discharge"
}

// 变异检查
func HasVariation(standardPath, actualPath *PathNode, mandatoryTasks map[string]bool) bool {
	var variance int
	ComparePaths(standardPath, actualPath, &variance, mandatoryTasks)
	return variance > 0
}

// 计算出径率、变异率和完成率
func CalculateRates(standardPath *PathNode, actualPaths []*PathNode, mandatoryTasks map[string]bool) (float64, float64, float64) {
	totalPatients := len(actualPaths)
	if totalPatients == 0 {
		return 0, 0, 0
	}

	dischargeCount := 0
	variationCount := 0
	completionCount := 0

	for _, actualPath := range actualPaths {
		if actualPath == nil {
			continue
		}

		if IsDischarged(actualPath) {
			dischargeCount++
		} else if HasVariation(standardPath, actualPath, mandatoryTasks) {
			variationCount++
		} else {
			completionCount++
		}
	}

	dischargeRate := float64(dischargeCount) / float64(totalPatients) * 100
	variationRate := float64(variationCount) / float64(totalPatients) * 100
	completionRate := float64(completionCount) / float64(totalPatients) * 100

	return dischargeRate, variationRate, completionRate
}

func ComparePath(standardBpmnFilePath string, unknownBpmnFilePath string) string {
	standardTasks, standardSequenceFlows, standardExclusiveGateways, standardParallelGateways, standardTimerEvents, standardStartEvents, err := ParseBPMN(standardBpmnFilePath)
	if err != nil {
		return fmt.Sprintf("Error parsing standard BPMN file: %v", err)
	}

	// 解析第二个BPMN
	unknownTasks, unknownSequenceFlows, unknownExclusiveGateways, unknownParallelGateways, unknownTimerEvents, unknownStartEvents, err := ParseBPMN(unknownBpmnFilePath)
	if err != nil {
		return fmt.Sprintf("Error parsing clinical BPMN file: %v", err)
	}

	if len(standardStartEvents) == 0 || len(unknownStartEvents) == 0 {
		return "No start events found in one of the BPMN files."
	}

	// 构建标准路径
	standardPaths := buildPaths(standardStartEvents[0], standardTasks, standardSequenceFlows, standardExclusiveGateways, standardParallelGateways, standardTimerEvents, nil)
	if len(standardPaths) == 0 {
		return "No standard paths found."
	}
	standardPath := standardPaths[0]

	// 构建真实临床路径
	unknownPaths := buildPaths(unknownStartEvents[0], unknownTasks, unknownSequenceFlows, unknownExclusiveGateways, unknownParallelGateways, unknownTimerEvents, nil)
	if len(unknownPaths) == 0 {
		return "No unknown paths found."
	}
	unknownPath := unknownPaths[0]

	var variance int
	ComparePaths(standardPath, unknownPath, &variance, make(map[string]bool))

	// 将路径转换为字符串
	standardPathStr := PathToString(standardPath, "")
	unknownPathStr := PathToString(unknownPath, "")

	// 组装最终返回的字符串
	result := fmt.Sprintf("Standard Path:\n%s\n\nUnknown Path:\n%s\n\n", standardPathStr, unknownPathStr)

	if variance > 0 {
		result += fmt.Sprintf("Path has %d variance(s) compared to the standard path.\n", variance)
	} else {
		result += "Paths match exactly!"
	}
	return result
}
