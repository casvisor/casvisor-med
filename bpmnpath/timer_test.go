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
	XMLName   xml.Name   `xml:"definitions"`
	Processes []Process  `xml:"process"`
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
	XMLName            xml.Name `xml:"sequenceFlow"`
	ID                 string   `xml:"id,attr"`
	SourceRef          string   `xml:"sourceRef,attr"`
	TargetRef          string   `xml:"targetRef,attr"`
	ConditionExpression string  `xml:"conditionExpression,omitempty"`
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

func PrintPath(node *PathNode, indent string) {
	if node == nil {
		return
	}

	fmt.Printf("%sTask: %s (Name: %s, Delay: %d days, Executed at: %v)\n", indent, node.Task.ID, node.Task.Name, node.Delay, node.ActualExecTime)

	indent += "    "

	// 如果有并行任务，先处理并行任务
	if len(node.Concurrent) > 0 {
		for _, concurrent := range node.Concurrent {
			fmt.Printf("%sConcurrent Task:\n", indent)
			PrintPath(concurrent, indent+"    ")
		}
	}

	// 然后处理顺序任务
	for _, next := range node.Next {
		PrintPath(next, indent)
	}
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
					ID:                 flowElement.ID,
					SourceRef:          sourceRef,
					TargetRef:          targetRef,
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
			fmt.Printf("Variable %s not found in provided data.\n", varName)
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
		return nil
	}

	visited[currentTask] = true
	task, exists := tasks[currentTask]
	if !exists {
		return nil
	}

	delay := timerEvents[currentTask]
	currentNode := NewPathNode(task, true, delay)

	nextFlows, hasNext := sequenceFlows[currentTask]
	if !hasNext {
		return []*PathNode{currentNode}
	}

	var allPaths []*PathNode

	if _, isExclusiveGateway := exclusiveGateways[currentTask]; isExclusiveGateway {
		for _, flow := range nextFlows {
			if evaluateCondition(flow.ConditionExpression, variables) {
				newVisited := make(map[string]bool)
				newPath := buildPathsHelper(flow.TargetRef, tasks, sequenceFlows, exclusiveGateways, parallelGateways, timerEvents, variables, newVisited)
				for _, path := range newPath {
					pathWithStart := NewPathNode(task, true, delay)
					pathWithStart.AddNext(path)
					allPaths = append(allPaths, pathWithStart)
				}
			}
		}
	} else if _, isParallelGateway := parallelGateways[currentTask]; isParallelGateway {
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

func main() {
	bpmnFilePath := "test_timer.bpmn"
	tasks, sequenceFlows, exclusiveGateways, parallelGateways, timerEvents, startEvents, err := ParseBPMN(bpmnFilePath)
	if err != nil {
		fmt.Println(err)
		return
	}
	if len(startEvents) == 0 {
		fmt.Println("No start events found in the BPMN file.")
		return
	}

	variables := map[string]float64{
		"GLU_value":     7.5,
		"BP_systolic":   120,
		"HR":            80,
	}

	// 构建标准路径
	standardPaths := buildPaths(startEvents[0], tasks, sequenceFlows, exclusiveGateways, parallelGateways, timerEvents, variables)
	if len(standardPaths) == 0 {
		fmt.Println("No standard paths found.")
		return
	}
	standardPath := standardPaths[0] // 选择第一条标准路径

	fmt.Println("Standard Clinical Path:")
	PrintPath(standardPath, "")

	// 添加实际路径数据
	actualPaths := []*PathNode{}

	// 实际路径1：提前进入第三阶段
	actualPath1 := NewPathNode(tasks["入院"], true, 0)
	firstPhase1 := NewPathNode(tasks["第一阶段"], true, 1)
	actualPath1.AddNext(firstPhase1)
	secondPhase1 := NewPathNode(tasks["第二阶段"], true, 10)
	firstPhase1.AddNext(secondPhase1)
	thirdPhase1 := NewPathNode(tasks["第三阶段"], true, 5) // 提前进入第三阶段
	secondPhase1.AddNext(thirdPhase1)
	actualPaths = append(actualPaths, actualPath1)

	// 实际路径2：缺失第二阶段
	actualPath2 := NewPathNode(tasks["入院"], true, 0)
	firstPhase2 := NewPathNode(tasks["第一阶段"], true, 1)
	actualPath2.AddNext(firstPhase2)
	thirdPhase2 := NewPathNode(tasks["第三阶段"], true, 15)
	firstPhase2.AddNext(thirdPhase2) // 缺失第二阶段
	actualPaths = append(actualPaths, actualPath2)

	// 实际路径3：每个阶段都提前进入
	actualPath3 := NewPathNode(tasks["入院"], true, 0)
	firstPhase3 := NewPathNode(tasks["第一阶段"], true, 1)
	actualPath3.AddNext(firstPhase3)
	secondPhase3 := NewPathNode(tasks["第二阶段"], true, 5) // 提前进入第二阶段
	firstPhase3.AddNext(secondPhase3)
	thirdPhase3 := NewPathNode(tasks["第三阶段"], true, 5) // 提前进入第三阶段
	secondPhase3.AddNext(thirdPhase3)
	actualPaths = append(actualPaths, actualPath3)

	// 实际路径4：只有第一阶段
	actualPath4 := NewPathNode(tasks["入院"], true, 0)
	firstPhase4 := NewPathNode(tasks["第一阶段"], true, 1)
	actualPath4.AddNext(firstPhase4)
	actualPaths = append(actualPaths, actualPath4)

	// 实际路径5：延迟进入每个阶段
	actualPath5 := NewPathNode(tasks["入院"], true, 0)
	firstPhase5 := NewPathNode(tasks["第一阶段"], true, 5) // 延迟进入第一阶段
	actualPath5.AddNext(firstPhase5)
	secondPhase5 := NewPathNode(tasks["第二阶段"], true, 10) // 延迟进入第二阶段
	firstPhase5.AddNext(secondPhase5)
	thirdPhase5 := NewPathNode(tasks["第三阶段"], true, 10) // 延迟进入第三阶段
	secondPhase5.AddNext(thirdPhase5)
	actualPaths = append(actualPaths, actualPath5)

	// 实际路径6：直接到达结束
	actualPath6 := NewPathNode(tasks["入院"], true, 0)
	endPhase6 := NewPathNode(tasks["结束"], true, 0) // 直接到达结束
	actualPath6.AddNext(endPhase6)
	actualPaths = append(actualPaths, actualPath6)

	// 实际路径7：进入每个阶段都需要较长时间
	actualPath7 := NewPathNode(tasks["入院"], true, 0)
	firstPhase7 := NewPathNode(tasks["第一阶段"], true, 5) // 进入第一阶段需要更长时间
	actualPath7.AddNext(firstPhase7)
	secondPhase7 := NewPathNode(tasks["第二阶段"], true, 15) // 进入第二阶段需要更长时间
	firstPhase7.AddNext(secondPhase7)
	thirdPhase7 := NewPathNode(tasks["第三阶段"], true, 20) // 进入第三阶段需要更长时间
	secondPhase7.AddNext(thirdPhase7)
	actualPaths = append(actualPaths, actualPath7)

	// 实际路径8：所有阶段都缺失
	actualPath8 := NewPathNode(tasks["入院"], true, 0)
	actualPaths = append(actualPaths, actualPath8)

	// 实际路径9：逐步进入每个阶段
	actualPath9 := NewPathNode(tasks["入院"], true, 0)
	firstPhase9 := NewPathNode(tasks["第一阶段"], true, 1)
	actualPath9.AddNext(firstPhase9)
	secondPhase9 := NewPathNode(tasks["第二阶段"], true, 5)
	firstPhase9.AddNext(secondPhase9)
	thirdPhase9 := NewPathNode(tasks["第三阶段"], true, 1)
	secondPhase9.AddNext(thirdPhase9)
	actualPaths = append(actualPaths, actualPath9)

	// 实际路径10：临近结束时突然延迟
	actualPath10 := NewPathNode(tasks["入院"], true, 0)
	firstPhase10 := NewPathNode(tasks["第一阶段"], true, 1)
	actualPath10.AddNext(firstPhase10)
	secondPhase10 := NewPathNode(tasks["第二阶段"], true, 1)
	firstPhase10.AddNext(secondPhase10)
	thirdPhase10 := NewPathNode(tasks["第三阶段"], true, 15) // 延迟
	secondPhase10.AddNext(thirdPhase10)
	actualPaths = append(actualPaths, actualPath10)

	mandatoryTasks := map[string]bool{}
	for id := range tasks {
		mandatoryTasks[id] = true
	}

	dischargeRate, variationRate, completionRate := CalculateRates(standardPath, actualPaths, mandatoryTasks)
	fmt.Printf("Discharge Rate: %.2f%%\n", dischargeRate)
	fmt.Printf("Variation Rate: %.2f%%\n", variationRate)
	fmt.Printf("Completion Rate: %.2f%%\n", completionRate)

	for _, actualPath := range actualPaths {
		fmt.Println("Comparing with actual path:")
		PrintPath(actualPath, "")
		var variance int
		ComparePaths(standardPath, actualPath, &variance, mandatoryTasks)
		if variance > 0 {
			fmt.Printf("Path has %d variance(s) compared to the standard path.\n", variance)
		} else {
			fmt.Println("Path matches the standard path.")
		}
	}
}

