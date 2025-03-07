// Copyright 2024 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import {Button, Card, Col, Input, Row} from "antd";
// import {LinkOutlined} from "@ant-design/icons";
import * as LearningBackend from "./backend/LearningBackend";
import * as Setting from "./Setting";
import i18next from "i18next";

class LearningEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      learningOwner: props.match.params.organizationName,
      learningName: props.match.params.learningName,
      learning: null,
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getLearning();
  }

  getLearning() {
    LearningBackend.getLearning(this.props.account.owner, this.state.learningName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            learning: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get learning: ${res.msg}`);
        }
      });
  }

  parseLearningField(key, value) {
    if ([].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateLearningField(key, value) {
    value = this.parseLearningField(key, value);

    const learning = this.state.learning;
    learning[key] = value;
    this.setState({
      learning: learning,
    });
  }

  renderLearning() {
    return (
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("learning:New Learning") : i18next.t("learning:Edit Learning")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitLearningEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitLearningEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} onClick={() => this.deleteLearning()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={{marginLeft: "5px"}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.learning.owner} onChange={e => {
              this.updateLearningField("owner", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.learning.name} onChange={e => {
              this.updateLearningField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("learning:Discription"), i18next.t("learning:Discription - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.learning.discription} onChange={e => {
              this.updateLearningField("discription", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("learning:Epoch"), i18next.t("learning:Epoch - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.learning.epoch} onChange={e => {
              this.updateLearningField("epoch", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("learning:ModelPath"), i18next.t("learning:ModelPath - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.learning.modelPath} onChange={e => {
              this.updateLearningField("modelPath", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("learning:hospitalName"), i18next.t("learning:Hospital Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.learning.hospitalName} onChange={e => {
              this.updateLearningField("hospitalName", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("learning:LocalBatchSize"), i18next.t("learning:LocalBatchSize - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.learning.localBatchSize} onChange={e => {
              this.updateLearningField("localBatchSize", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("learning:LocalEpochs"), i18next.t("learning:LocalEpochs - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.learning.localEpochs} onChange={e => {
              this.updateLearningField("localEpochs", e.target.value);
            }} />
          </Col>
        </Row>
      </Card>
    );
  }

  submitLearningEdit(willExist) {
    const learning = Setting.deepCopy(this.state.learning);
    LearningBackend.updateLearning(this.state.learning.owner, this.state.learningName, learning)
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "Successfully saved");
            this.setState({
              learningName: this.state.learning.name,
            });
            if (willExist) {
              this.props.history.push("/learnings");
            } else {
              this.props.history.push(`/learnings/${this.state.learning.owner}/${encodeURIComponent(this.state.learning.name)}`);
            }
            // this.getLearning(true);
          } else {
            Setting.showMessage("error", "failed to save: server side failure");
            this.updateLearningField("name", this.state.learningName);
          }
        } else {
          Setting.showMessage("error", `failed to save: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  deleteLearning() {
    LearningBackend.deleteLearning(this.state.learning)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/learnings");
        } else {
          Setting.showMessage("error", `${i18next.t("general:Failed to delete")}: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `${i18next.t("general:Failed to connect to server")}: ${error}`);
      });
  }

  render() {
    return (
      <div>
        {
          this.state.learning !== null ? this.renderLearning() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" onClick={() => this.submitLearningEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitLearningEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} size="large" onClick={() => this.deleteLearning()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default LearningEditPage;
