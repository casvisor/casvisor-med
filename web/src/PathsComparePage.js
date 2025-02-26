import React from "react";
import {Button, Card, Col, Input, message, Row, Upload} from "antd";
import * as Setting from "./Setting";
import i18next from "i18next";
import moment from "moment";
import * as PathsCompareBackend from "./backend/PathsCompareBackend";

class PathsComparePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      standardBpmnFile: null,
      unknownBpmnFile: null,
      compareResult: "",  // 用来保存后端返回的路径对比结果
      patient: {  // 新增 patient 字段
        owner: this.props.account.owner,  // 默认值
        name: `patient_${Setting.getRandomName()}`,  // 默认值
        createdTime: moment().format(),  // 默认值
        updatedTime: moment().format(),  // 默认值
        displayName: `New Patient - ${Setting.getRandomName()}`,  // 默认值
      },
    };
  }

  // 处理标准 BPMN 文件上传
  handleStandardFileChange = (info) => {
    if (info.file.status === "done") {
      this.setState({
        standardBpmnFile: info.file.originFileObj,
      });
      message.success("标准 BPMN 文件上传成功");
    } else if (info.file.status === "error") {
      message.error("标准 BPMN 文件上传失败");
    }
  };

  // 处理未知 BPMN 文件上传
  handleUnknownFileChange = (info) => {
    if (info.file.status === "done") {
      this.setState({
        unknownBpmnFile: info.file.originFileObj,
      });
      message.success("实际 BPMN 文件上传成功");
    } else if (info.file.status === "error") {
      message.error("实际 BPMN 文件上传失败");
    }
  };

  // 提交路径对比请求
  submitPathsCompare = () => {
    const {standardBpmnFile, unknownBpmnFile, patient} = this.state;

    // 检查必填字段
    if (!patient.owner || !patient.name) {
      message.error("Owner and Name must be filled!");
      return;
    }

    if (!standardBpmnFile || !unknownBpmnFile) {
      message.error(i18next.t("general:Please upload both BPMN files"));
      return;
    }

    // 传递给后端进行处理
    const formData = new FormData();
    formData.append("standardBpmn", standardBpmnFile);
    formData.append("unknownBpmn", unknownBpmnFile);

    PathsCompareBackend.compareBpmn(formData)
      .then((res) => {
        // console.log(res); // 打印返回的结果，查看是否正确
        if (res.status === "ok") {
          message.success(i18next.t("general:Paths compared successfully"));
          // 确保从 res.data.result 中获取正确的返回值
          this.setState({compareResult: res.data.result});
        } else {
          message.error(`失败: ${res.msg}`);
        }
      })
      .catch((error) => {
        message.error(`请求失败: ${error}`);
      });
  };

  // 更新 patient 字段
  updatePatientField = (key, value) => {
    this.setState((prevState) => ({
      patient: {
        ...prevState.patient,
        [key]: value,
      },
    }));
  };

  render() {
    const {patient} = this.state;

    return (
      <div>
        {/* 上传文件部分 */}
        <Card size="small" title={i18next.t("pathsCompare:Compare Paths")} style={{marginLeft: "5px"}} type="inner">
          <Row style={{marginTop: "10px"}}>
            <Col style={{marginTop: "5px"}} span={4}>
              {Setting.getLabel(i18next.t("general:Standard BPMN File"), i18next.t("general:Standard BPMN File - Tooltip"))}:
            </Col>
            <Col span={20}>
              <Upload
                customRequest={(options) => options.onSuccess(null, options.file)}
                showUploadList={false}
                onChange={this.handleStandardFileChange}
                accept=".bpmn"
              >
                <Button>{i18next.t("general:Upload Standard BPMN File")}</Button>
              </Upload>
            </Col>
          </Row>

          <Row style={{marginTop: "20px"}}>
            <Col style={{marginTop: "5px"}} span={4}>
              {Setting.getLabel(i18next.t("general:Unknown BPMN File"), i18next.t("general:Unknown BPMN File - Tooltip"))}:
            </Col>
            <Col span={20}>
              <Upload
                customRequest={(options) => options.onSuccess(null, options.file)}
                showUploadList={false}
                onChange={this.handleUnknownFileChange}
                accept=".bpmn"
              >
                <Button>{i18next.t("general:Upload Unknown BPMN File")}</Button>
              </Upload>
            </Col>
          </Row>
        </Card>

        {/* 需要填写的 Patient 信息部分 */}
        <Card size="small" title="Patient Information" style={{marginTop: "20px"}} type="inner">
          <Row>
            <Col span={4}>
                            Owner:
            </Col>
            <Col span={20}>
              <Input
                value={patient.owner}
                onChange={(e) => this.updatePatientField("owner", e.target.value)}
              />
            </Col>
          </Row>
          <Row style={{marginTop: "10px"}}>
            <Col span={4}>
                            Name:
            </Col>
            <Col span={20}>
              <Input
                value={patient.name}
                onChange={(e) => this.updatePatientField("name", e.target.value)}
              />
            </Col>
          </Row>
          <Row style={{marginTop: "10px"}}>
            <Col span={4}>
                            Created Time:
            </Col>
            <Col span={20}>
              <Input
                value={patient.createdTime}
                onChange={(e) => this.updatePatientField("createdTime", e.target.value)}
              />
            </Col>
          </Row>
          <Row style={{marginTop: "10px"}}>
            <Col span={4}>
                            Updated Time:
            </Col>
            <Col span={20}>
              <Input
                value={patient.updatedTime}
                onChange={(e) => this.updatePatientField("updatedTime", e.target.value)}
              />
            </Col>
          </Row>
          <Row style={{marginTop: "10px"}}>
            <Col span={4}>
                            Display Name:
            </Col>
            <Col span={20}>
              <Input
                value={patient.displayName}
                onChange={(e) => this.updatePatientField("displayName", e.target.value)}
              />
            </Col>
          </Row>
        </Card>

        {/* 提交按钮 */}
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" type="primary" onClick={this.submitPathsCompare}>
            {i18next.t("general:Submit")}
          </Button>
        </div>

        {/* 新增一个结果框 */}
        <Card
          title={i18next.t("pathsCompare:Comparison Result")}
          style={{marginTop: "20px", marginLeft: "5px"}}
          type="inner"
        >
          <div
            style={{
              maxHeight: "300px", // 限制最大高度
              overflowY: "auto",  // 启用滚动条
              width: "70%",       // 设定宽度为50%
              backgroundColor: "#000", // 黑色背景
              color: "#fff",      // 白色文字
              padding: "10px",
              fontFamily: "monospace", // 等宽字体
              whiteSpace: "pre-wrap",  // 保留换行
            }}
          >
            {this.state.compareResult || "对比结果"} {/* 如果没有返回结果，显示"对比结果" */}
          </div>

        </Card>
      </div>
    );
  }
}

export default PathsComparePage;
