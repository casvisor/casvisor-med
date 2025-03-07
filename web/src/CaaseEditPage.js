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
import * as CaaseBackend from "./backend/CaaseBackend";
import * as Setting from "./Setting";
import i18next from "i18next";

class CaaseEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      caaseOwner: props.match.params.organizationName,
      caaseName: props.match.params.caaseName,
      caase: null,
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getCaase();
  }

  getCaase() {
    CaaseBackend.getCaase(this.props.account.owner, this.state.caaseName).then(
      (res) => {
        if (res.status === "ok") {
          this.setState({
            caase: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get caase: ${res.msg}`);
        }
      }
    );
  }

  parseCaaseField(key, value) {
    if ([].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateCaaseField(key, value) {
    value = this.parseCaaseField(key, value);

    const caase = this.state.caase;
    caase[key] = value;
    this.setState({
      caase: caase,
    });
  }

  renderCaase() {
    return (
      <Card
        size="small"
        title={
          <div>
            {this.state.mode === "add"
              ? i18next.t("caase:New Caase")
              : i18next.t("caase:Edit Caase")}
            &nbsp;&nbsp;&nbsp;&nbsp;
            <Button onClick={() => this.submitCaaseEdit(false)}>
              {i18next.t("general:Save")}
            </Button>
            <Button
              style={{marginLeft: "20px"}}
              type="primary"
              onClick={() => this.submitCaaseEdit(true)}
            >
              {i18next.t("general:Save & Exit")}
            </Button>
            {this.state.mode === "add" ? (
              <Button
                style={{marginLeft: "20px"}}
                onClick={() => this.deleteCaase()}
              >
                {i18next.t("general:Cancel")}
              </Button>
            ) : null}
          </div>
        }
        style={{marginLeft: "5px"}}
        type="inner"
      >
        <Row style={{marginTop: "10px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("general:Organization"),
              i18next.t("general:Organization - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.owner}
              onChange={(e) => {
                this.updateCaaseField("owner", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("general:Name"),
              i18next.t("general:Name - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.name}
              onChange={(e) => {
                this.updateCaaseField("name", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:Symptoms"),
              i18next.t("caase:Symptoms - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.symptoms}
              onChange={(e) => {
                this.updateCaaseField("symptoms", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:Diagnosis"),
              i18next.t("caase:Diagnosis - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.diagnosis}
              onChange={(e) => {
                this.updateCaaseField("diagnosis", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:DiagnosisDate"),
              i18next.t("caase:DiagnosisDate - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.diagnosisDate}
              onChange={(e) => {
                this.updateCaaseField("diagnosisDate", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:Prescription"),
              i18next.t("caase:Prescription - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.prescription}
              onChange={(e) => {
                this.updateCaaseField("prescription", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:FollowUp"),
              i18next.t("caase:FollowUp - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.followUp}
              onChange={(e) => {
                this.updateCaaseField("followUp", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:HISInterfaceInfo"),
              i18next.t("caase:HISInterfaceInfo - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.HISInterfaceInfo}
              onChange={(e) => {
                this.updateCaaseField("HISInterfaceInfo", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:PrimaryCarePhysician"),
              i18next.t("caase:PrimaryCarePhysician - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.primaryCarePhysician}
              onChange={(e) => {
                this.updateCaaseField("primaryCarePhysician", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:Type"),
              i18next.t("caase:Type - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.type}
              onChange={(e) => {
                this.updateCaaseField("type", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:PatientName"),
              i18next.t("caase:PatientName - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.patientName}
              onChange={(e) => {
                this.updateCaaseField("patientName", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:DoctorName"),
              i18next.t("caase:DoctorName - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.doctorName}
              onChange={(e) => {
                this.updateCaaseField("doctorName", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:SpecialistAllianceID"),
              i18next.t("caase:SpecialistAllianceID - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.specialistAllianceID}
              onChange={(e) => {
                this.updateCaaseField("specialistAllianceID", e.target.value);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={Setting.isMobile() ? 22 : 2}>
            {Setting.getLabel(
              i18next.t("caase:IntegratedCareOrganizationID"),
              i18next.t("caase:IntegratedCareOrganizationID - Tooltip")
            )}{" "}
            :
          </Col>
          <Col span={22}>
            <Input
              value={this.state.caase.integratedCareOrganizationID}
              onChange={(e) => {
                this.updateCaaseField(
                  "integratedCareOrganizationID",
                  e.target.value
                );
              }}
            />
          </Col>
        </Row>
      </Card>
    );
  }

  submitCaaseEdit(willExist) {
    const caase = Setting.deepCopy(this.state.caase);
    CaaseBackend.updateCaase(
      this.state.caase.owner,
      this.state.caaseName,
      caase
    )
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "Successfully saved");
            this.setState({
              caaseName: this.state.caase.name,
            });
            if (willExist) {
              this.props.history.push("/caases");
            } else {
              this.props.history.push(
                `/caases/${this.state.caase.owner}/${encodeURIComponent(this.state.caase.name)}`
              );
            }
            // this.getCaase(true);
          } else {
            Setting.showMessage("error", "failed to save: server side failure");
            this.updateCaaseField("name", this.state.caaseName);
          }
        } else {
          Setting.showMessage("error", `failed to save: ${res.msg}`);
        }
      })
      .catch((error) => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  deleteCaase() {
    CaaseBackend.deleteCaase(this.state.caase)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/caases");
        } else {
          Setting.showMessage(
            "error",
            `${i18next.t("general:Failed to delete")}: ${res.msg}`
          );
        }
      })
      .catch((error) => {
        Setting.showMessage(
          "error",
          `${i18next.t("general:Failed to connect to server")}: ${error}`
        );
      });
  }

  render() {
    return (
      <div>
        {this.state.caase !== null ? this.renderCaase() : null}
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" onClick={() => this.submitCaaseEdit(false)}>
            {i18next.t("general:Save")}
          </Button>
          <Button
            style={{marginLeft: "20px"}}
            type="primary"
            size="large"
            onClick={() => this.submitCaaseEdit(true)}
          >
            {i18next.t("general:Save & Exit")}
          </Button>
          {this.state.mode === "add" ? (
            <Button
              style={{marginLeft: "20px"}}
              size="large"
              onClick={() => this.deleteCaase()}
            >
              {i18next.t("general:Cancel")}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }
}

export default CaaseEditPage;
