// Copyright 2024 The casbin Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import {Button, Card, Col, Input, Row, Select} from "antd";
import * as CaseBackend from "./backend/CaseBackend";
import * as Setting from "./Setting";
import i18next from "i18next";

class CaseEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      caseOwner: props.match.params.organizationName,
      caseName: props.match.params.caseName,
      case: null,
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getCase();
  }

  getCase() {
    CaseBackend.getCase(this.props.account.owner, this.state.caseName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            case: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get case: ${res.msg}`);
        }
      });
  }

  parseCaseField(key, value) {
    if ([].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateCaseField(key, value) {
    value = this.parseCaseField(key, value);

    const case = this.state.case;
    case[key] = value;
    this.setState({
      case: case,
    });
  }

  renderCase() {
    return (
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("case:New Case") : i18next.t("case:Edit Case")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitCaseEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitCaseEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} onClick={() => this.deleteCase()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={{marginLeft: "5px"}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.case.owner} onChange={e => {
              this.updateCaseField("owner", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.case.name} onChange={e => {
              this.updateCaseField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Symptoms"), i18next.t("general:Symptoms - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.symptoms}
              onChange={(e) => {
                this.updateCaseField("symptoms", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Diagnosis"), i18next.t("general:Diagnosis - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.diagnosis}
              onChange={(e) => {
                this.updateCaseField("diagnosis", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:DiagnosisDate"), i18next.t("general:DiagnosisDate - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.diagnosisDate}
              onChange={(e) => {
                this.updateCaseField("diagnosisDate", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Prescription"), i18next.t("general:Prescription - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.prescription}
              onChange={(e) => {
                this.updateCaseField("prescription", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:FollowUp"), i18next.t("general:FollowUp - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.followUp}
              onChange={(e) => {
                this.updateCaseField("followUp", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Variation"), i18next.t("general:Variation - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Select
              virtual={false} style={{width: "100%"}}
              value={this.state.case.variation}
              onChange={(value) => {
                this.updateCaseField("variation", value);
              }}
              options={[
                { value: true, label: i18next.t("general:Yes") },
                { value: false, label: i18next.t("general:No") },
              ].map(item => Setting.getOption(item.label, item.value))}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:HISInterfaceInfo"), i18next.t("general:HISInterfaceInfo - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.hisInterfaceInfo}
              onChange={(e) => {
                this.updateCaseField("hisInterfaceInfo", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:PrimaryCarePhysician"), i18next.t("general:PrimaryCarePhysician - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.primaryCarePhysician}
              onChange={(e) => {
                this.updateCaseField("primaryCarePhysician", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Type"), i18next.t("general:Type - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.type}
              onChange={(e) => {
                this.updateCaseField("type", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:PatientName"), i18next.t("general:PatientName - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.patientName}
              onChange={(e) => {
                this.updateCaseField("patientName", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:DoctorName"), i18next.t("general:DoctorName - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.doctorName}
              onChange={(e) => {
                this.updateCaseField("doctorName", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:SpecialistAllianceID"), i18next.t("general:SpecialistAllianceID - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.specialistAllianceID}
              onChange={(e) => {
                this.updateCaseField("specialistAllianceID", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:IntegratedCareOrganizationID"), i18next.t("general:IntegratedCareOrganizationID - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.case.integratedCareOrganizationID}
              onChange={(e) => {
                this.updateCaseField("integratedCareOrganizationID", e.target.value);
              }}
            />
          </Col>
        </Row>
      </Card>
    );
  }

  submitCaseEdit(willExist) {
    const case = Setting.deepCopy(this.state.case);
    CaseBackend.updateCase(this.state.case.owner, this.state.caseName, case)
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "Successfully saved");
            this.setState({
              caseName: this.state.case.name,
            });
            if (willExist) {
              this.props.history.push("/cases");
            } else {
              this.props.history.push(`/cases/${this.state.case.owner}/${encodeURIComponent(this.state.case.name)}`);
            }
            // this.getCase(true);
          } else {
            Setting.showMessage("error", "failed to save: server side failure");
            this.updateCaseField("name", this.state.caseName);
          }
        } else {
          Setting.showMessage("error", `failed to save: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  deleteCase() {
    CaseBackend.deleteCase(this.state.case)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/cases");
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
          this.state.case !== null ? this.renderCase() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" onClick={() => this.submitCaseEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitCaseEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} size="large" onClick={() => this.deleteCase()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default CaseEditPage;
