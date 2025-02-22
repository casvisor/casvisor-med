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
import * as PatientBackend from "./backend/PatientBackend";
import * as Setting from "./Setting";
import i18next from "i18next";

class PatientEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      patientOwner: props.match.params.organizationName,
      patientName: props.match.params.patientName,
      patient: null,
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getPatient();
  }

  getPatient() {
    PatientBackend.getPatient(this.props.account.owner, this.state.patientName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            patient: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get patient: ${res.msg}`);
        }
      });
  }

  parsePatientField(key, value) {
    if ([].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updatePatientField(key, value) {
    value = this.parsePatientField(key, value);

    const patient = this.state.patient;
    patient[key] = value;
    this.setState({
      patient: patient,
    });
  }

  renderPatient() {
    return (
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("patient:New Patient") : i18next.t("patient:Edit Patient")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitPatientEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitPatientEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} onClick={() => this.deletePatient()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={{marginLeft: "5px"}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.patient.owner} onChange={e => {
              this.updatePatientField("owner", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.patient.name} onChange={e => {
              this.updatePatientField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("patient:Category"), i18next.t("patient:Category - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.patient.category} onChange={value => {
              this.updatePatientField("category", value);
              if (value === "Public Cloud") {
                this.updatePatientField("type", "Amazon Web Services");
              } else if (value === "Private Cloud") {
                this.updatePatientField("type", "KVM");
              } else if (value === "Blockchain") {
                this.updatePatientField("type", "Hyperledger Fabric");
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
            <Input value={this.state.patient.clientId} onChange={e => {
              this.updatePatientField("clientId", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Client secret"), i18next.t("general:Client secret - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.patient.clientSecret} onChange={e => {
              this.updatePatientField("clientSecret", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Region"), i18next.t("general:Region - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.patient.region} onChange={e => {
              this.updatePatientField("region", e.target.value);
            }} />
          </Col>
        </Row>
        {
          this.state.patient.category !== "Blockchain" ? null : (
            <React.Fragment>
              <Row style={{marginTop: "20px"}} >
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {Setting.getLabel(i18next.t("general:Network"), i18next.t("general:Network - Tooltip"))} :
                </Col>
                <Col span={22} >
                  <Input value={this.state.patient.network} onChange={e => {
                    this.updatePatientField("network", e.target.value);
                  }} />
                </Col>
              </Row>
              <Row style={{marginTop: "20px"}} >
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {Setting.getLabel(i18next.t("general:Chain"), i18next.t("general:Chain - Tooltip"))} :
                </Col>
                <Col span={22} >
                  <Input value={this.state.patient.chain} onChange={e => {
                    this.updatePatientField("chain", e.target.value);
                  }} />
                </Col>
              </Row>
            </React.Fragment>
          )
        }
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("patient:Browser URL"), i18next.t("patient:Browser URL - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined />} value={this.state.patient.browserUrl} onChange={e => {
              this.updatePatientField("browserUrl", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("patient:Patient URL"), i18next.t("patient:Patient URL - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined />} value={this.state.patient.patientUrl} onChange={e => {
              this.updatePatientField("patientUrl", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("patient:State"), i18next.t("patient:State - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.patient.state} onChange={value => {
              this.updatePatientField("state", value);
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

  submitPatientEdit(willExist) {
    const patient = Setting.deepCopy(this.state.patient);
    PatientBackend.updatePatient(this.state.patient.owner, this.state.patientName, patient)
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "Successfully saved");
            this.setState({
              patientName: this.state.patient.name,
            });
            if (willExist) {
              this.props.history.push("/patients");
            } else {
              this.props.history.push(`/patients/${this.state.patient.owner}/${encodeURIComponent(this.state.patient.name)}`);
            }
            // this.getPatient(true);
          } else {
            Setting.showMessage("error", "failed to save: server side failure");
            this.updatePatientField("name", this.state.patientName);
          }
        } else {
          Setting.showMessage("error", `failed to save: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  deletePatient() {
    PatientBackend.deletePatient(this.state.patient)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/patients");
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
          this.state.patient !== null ? this.renderPatient() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" onClick={() => this.submitPatientEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitPatientEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} size="large" onClick={() => this.deletePatient()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default PatientEditPage;
