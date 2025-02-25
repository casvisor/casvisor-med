// Copyright 2023 The casbin Authors. All Rights Reserved.
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
import {Button, Card, Col, Input, Row, Switch} from "antd";
import * as ConsumerBackend from "./backend/ConsumerBackend";
import * as Setting from "./Setting";
import i18next from "i18next";

import {Controlled as CodeMirror} from "react-codemirror2";
import "codemirror/lib/codemirror.css";
require("codemirror/theme/material-darker.css");
require("codemirror/mode/javascript/javascript");

// const {Option} = Select;

class ConsumerEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      consumerOwner: props.match.params.organizationName,
      consumerName: props.match.params.consumerName,
      consumer: null,
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getConsumer();
  }

  getConsumer() {
    ConsumerBackend.getConsumer(this.props.account.owner, this.state.consumerName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            consumer: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get consumer: ${res.msg}`);
        }
      });
  }

  parseConsumerField(key, value) {
    if ([""].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateConsumerField(key, value) {
    value = this.parseConsumerField(key, value);

    const consumer = this.state.consumer;
    consumer[key] = value;
    this.setState({
      consumer: consumer,
    });
  }

  renderConsumer() {
    // const history = useHistory();
    return (
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("consumer:New Consumer") : i18next.t("consumer:View Consumer")}&nbsp;&nbsp;&nbsp;&nbsp;
          {this.state.mode !== "123" ? (
            <React.Fragment>
              <Button onClick={() => this.submitConsumerEdit(false)}>{i18next.t("general:Save")}</Button>
              <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitConsumerEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
            </React.Fragment>
          ) : (
            <Button type="primary" onClick={() => this.props.history.push("/consumers")}>{i18next.t("general:Exit")}</Button>
          )}
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} onClick={() => this.deleteConsumer()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={{marginLeft: "5px"}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.consumer.owner} onChange={e => {
              // this.updateConsumerField("owner", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.consumer.name} onChange={e => {
              // this.updateConsumerField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Blockchain Provider"), i18next.t("general:Blockchain Provider - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input disabled={false} value={this.state.consumer.chainProvider} onChange={e => {
              // this.updateRecordField("chainProvider", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Block"), i18next.t("general:Block - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.consumer.block} onChange={e => {
              this.updateConsumerField("block", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:TEE Provider"), i18next.t("general:TEE Provider - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input disabled={false} value={this.state.consumer.teeProvider} onChange={e => {
              // this.updateRecordField("teeProvider", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Dataset ID"), i18next.t("general:Dataset ID - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.consumer.datasetId} onChange={e => {
              this.updateConsumerField("datasetId", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Attest ID"), i18next.t("general:Attest ID - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.consumer.attestId} onChange={e => {
              this.updateConsumerField("attestId", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Task ID"), i18next.t("general:Task ID - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.consumer.taskId} onChange={e => {
              this.updateConsumerField("taskId", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Signer ID"), i18next.t("general:Signer ID - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.consumer.signerId} onChange={e => {
              this.updateConsumerField("signerId", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Object"), i18next.t("general:Object - Tooltip"))} :
          </Col>
          <Col span={22} >
            <div style={{width: "900px", height: "300px"}}>
              <CodeMirror
                value={Setting.formatJsonString(this.state.consumer.object)}
                options={{mode: "javascript", theme: "material-darker"}}
                onBeforeChange={(editor, data, value) => {
                }}
              />
            </div>
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Response"), i18next.t("general:Response - Tooltip"))} :
          </Col>
          <Col span={22}>
            <div style={{width: "900px", height: "300px"}}>
              <CodeMirror
                value={Setting.formatJsonString(this.state.consumer.response)}
                options={{mode: "javascript", theme: "material-darker"}}
                onBeforeChange={(editor, data, value) => {
                }}
              />
            </div>
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Result"), i18next.t("general:Result - Tooltip"))} :
          </Col>
          <Col span={22}>
            <div style={{width: "900px", height: "300px"}}>
              <CodeMirror
                value={Setting.formatJsonString(this.state.consumer.result)}
                options={{mode: "javascript", theme: "material-darker"}}
                onBeforeChange={(editor, data, value) => {
                }}
              />
            </div>
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 19 : 2}>
            {Setting.getLabel(i18next.t("general:Is run"), i18next.t("general:Is run - Tooltip"))} :
          </Col>
          <Col span={1} >
            <Switch disabled={false} checked={this.state.consumer.isRun} onChange={checked => {
              // this.updateConsumerField("isRun", checked);
            }} />
          </Col>
        </Row>
      </Card>
    );
  }

  submitConsumerEdit(willExist) {
    const consumer = Setting.deepCopy(this.state.consumer);
    ConsumerBackend.updateConsumer(this.state.consumer.owner, this.state.consumerName, consumer)
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "Successfully saved");
            this.setState({
              consumerName: this.state.consumer.name,
            });
            if (willExist) {
              this.props.history.push("/consumers");
            } else {
              this.props.history.push(`/consumers/${this.state.consumer.owner}/${encodeURIComponent(this.state.consumer.name)}`);
            }
          } else {
            Setting.showMessage("error", "failed to save: server side failure");
            this.updateConsumerField("name", this.state.consumerName);
          }
        } else {
          Setting.showMessage("error", `failed to save: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  deleteConsumer() {
    ConsumerBackend.deleteConsumer(this.state.consumer)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/consumers");
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
          this.state.consumer !== null ? this.renderConsumer() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          {this.state.mode !== "123" ? (
            <React.Fragment>
              <Button size="large" onClick={() => this.submitConsumerEdit(false)}>{i18next.t("general:Save")}</Button>
              <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitConsumerEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
            </React.Fragment>
          ) : (
            <Button type="primary" size="large" onClick={() => this.props.history.push("/consumers")}>{i18next.t("general:Exit")}</Button>
          )}
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} size="large" onClick={() => this.deleteConsumer()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default ConsumerEditPage;
