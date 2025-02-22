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
import {Button, Card, Col, Input, Row, Select} from "antd";
import {LinkOutlined} from "@ant-design/icons";
import * as ConsultationBackend from "./backend/ConsultationBackend";
import * as Setting from "./Setting";
import i18next from "i18next";

class ConsultationEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      consultationOwner: props.match.params.organizationName,
      consultationName: props.match.params.consultationName,
      consultation: null,
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getConsultation();
  }

  getConsultation() {
    ConsultationBackend.getConsultation(this.props.account.owner, this.state.consultationName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            consultation: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get consultation: ${res.msg}`);
        }
      });
  }

  parseConsultationField(key, value) {
    if ([].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateConsultationField(key, value) {
    value = this.parseConsultationField(key, value);

    const consultation = this.state.consultation;
    consultation[key] = value;
    this.setState({
      consultation: consultation,
    });
  }

  renderConsultation() {
    return (
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("consultation:New Consultation") : i18next.t("consultation:Edit Consultation")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitConsultationEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitConsultationEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} onClick={() => this.deleteConsultation()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={{marginLeft: "5px"}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.consultation.owner} onChange={e => {
              this.updateConsultationField("owner", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.consultation.name} onChange={e => {
              this.updateConsultationField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("consultation:Category"), i18next.t("consultation:Category - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.consultation.category} onChange={value => {
              this.updateConsultationField("category", value);
              if (value === "Public Cloud") {
                this.updateConsultationField("type", "Amazon Web Services");
              } else if (value === "Private Cloud") {
                this.updateConsultationField("type", "KVM");
              } else if (value === "Blockchain") {
                this.updateConsultationField("type", "Hyperledger Fabric");
              }
            }}
            options={[
              {value: "Public Cloud", label: "Public Cloud"},
              {value: "Private Cloud", label: "Private Cloud"},
              {value: "Blockchain", label: "Blockchain"},
            ].map(item => Setting.getOption(item.label, item.value))} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Client ID"), i18next.t("general:Client ID - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.consultation.clientId} onChange={e => {
              this.updateConsultationField("clientId", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Client secret"), i18next.t("general:Client secret - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.consultation.clientSecret} onChange={e => {
              this.updateConsultationField("clientSecret", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Region"), i18next.t("general:Region - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.consultation.region} onChange={e => {
              this.updateConsultationField("region", e.target.value);
            }} />
          </Col>
        </Row>
        {
          this.state.consultation.category !== "Blockchain" ? null : (
            <React.Fragment>
              <Row style={{marginTop: "20px"}} >
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {Setting.getLabel(i18next.t("general:Network"), i18next.t("general:Network - Tooltip"))} :
                </Col>
                <Col span={22} >
                  <Input value={this.state.consultation.network} onChange={e => {
                    this.updateConsultationField("network", e.target.value);
                  }} />
                </Col>
              </Row>
              <Row style={{marginTop: "20px"}} >
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {Setting.getLabel(i18next.t("general:Chain"), i18next.t("general:Chain - Tooltip"))} :
                </Col>
                <Col span={22} >
                  <Input value={this.state.consultation.chain} onChange={e => {
                    this.updateConsultationField("chain", e.target.value);
                  }} />
                </Col>
              </Row>
            </React.Fragment>
          )
        }
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("consultation:Browser URL"), i18next.t("consultation:Browser URL - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined />} value={this.state.consultation.browserUrl} onChange={e => {
              this.updateConsultationField("browserUrl", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("consultation:Consultation URL"), i18next.t("consultation:Consultation URL - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined />} value={this.state.consultation.consultationUrl} onChange={e => {
              this.updateConsultationField("consultationUrl", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("consultation:State"), i18next.t("consultation:State - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.consultation.state} onChange={value => {
              this.updateConsultationField("state", value);
            }}
            options={[
              {value: "Active", label: "Active"},
              {value: "Inactive", label: "Inactive"},
            ].map(item => Setting.getOption(item.label, item.value))} />
          </Col>
        </Row>
      </Card>
    );
  }

  submitConsultationEdit(willExist) {
    const consultation = Setting.deepCopy(this.state.consultation);
    ConsultationBackend.updateConsultation(this.state.consultation.owner, this.state.consultationName, consultation)
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "Successfully saved");
            this.setState({
              consultationName: this.state.consultation.name,
            });
            if (willExist) {
              this.props.history.push("/consultations");
            } else {
              this.props.history.push(`/consultations/${this.state.consultation.owner}/${encodeURIComponent(this.state.consultation.name)}`);
            }
            // this.getConsultation(true);
          } else {
            Setting.showMessage("error", "failed to save: server side failure");
            this.updateConsultationField("name", this.state.consultationName);
          }
        } else {
          Setting.showMessage("error", `failed to save: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  deleteConsultation() {
    ConsultationBackend.deleteConsultation(this.state.consultation)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/consultations");
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
          this.state.consultation !== null ? this.renderConsultation() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" onClick={() => this.submitConsultationEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitConsultationEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} size="large" onClick={() => this.deleteConsultation()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default ConsultationEditPage;
