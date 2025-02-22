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
import * as HospitalBackend from "./backend/HospitalBackend";
import * as Setting from "./Setting";
import i18next from "i18next";

class HospitalEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      hospitalOwner: props.match.params.organizationName,
      hospitalName: props.match.params.hospitalName,
      hospital: null,
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getHospital();
  }

  getHospital() {
    HospitalBackend.getHospital(this.props.account.owner, this.state.hospitalName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            hospital: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get hospital: ${res.msg}`);
        }
      });
  }

  parseHospitalField(key, value) {
    if ([].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateHospitalField(key, value) {
    value = this.parseHospitalField(key, value);

    const hospital = this.state.hospital;
    hospital[key] = value;
    this.setState({
      hospital: hospital,
    });
  }

  renderHospital() {
    return (
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("hospital:New Hospital") : i18next.t("hospital:Edit Hospital")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitHospitalEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitHospitalEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} onClick={() => this.deleteHospital()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={{marginLeft: "5px"}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.hospital.owner} onChange={e => {
              this.updateHospitalField("owner", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.hospital.name} onChange={e => {
              this.updateHospitalField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("hospital:Category"), i18next.t("hospital:Category - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.hospital.category} onChange={value => {
              this.updateHospitalField("category", value);
              if (value === "Public Cloud") {
                this.updateHospitalField("type", "Amazon Web Services");
              } else if (value === "Private Cloud") {
                this.updateHospitalField("type", "KVM");
              } else if (value === "Blockchain") {
                this.updateHospitalField("type", "Hyperledger Fabric");
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
            <Input value={this.state.hospital.clientId} onChange={e => {
              this.updateHospitalField("clientId", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Client secret"), i18next.t("general:Client secret - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.hospital.clientSecret} onChange={e => {
              this.updateHospitalField("clientSecret", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Region"), i18next.t("general:Region - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.hospital.region} onChange={e => {
              this.updateHospitalField("region", e.target.value);
            }} />
          </Col>
        </Row>
        {
          this.state.hospital.category !== "Blockchain" ? null : (
            <React.Fragment>
              <Row style={{marginTop: "20px"}} >
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {Setting.getLabel(i18next.t("general:Network"), i18next.t("general:Network - Tooltip"))} :
                </Col>
                <Col span={22} >
                  <Input value={this.state.hospital.network} onChange={e => {
                    this.updateHospitalField("network", e.target.value);
                  }} />
                </Col>
              </Row>
              <Row style={{marginTop: "20px"}} >
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {Setting.getLabel(i18next.t("general:Chain"), i18next.t("general:Chain - Tooltip"))} :
                </Col>
                <Col span={22} >
                  <Input value={this.state.hospital.chain} onChange={e => {
                    this.updateHospitalField("chain", e.target.value);
                  }} />
                </Col>
              </Row>
            </React.Fragment>
          )
        }
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("hospital:Browser URL"), i18next.t("hospital:Browser URL - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined />} value={this.state.hospital.browserUrl} onChange={e => {
              this.updateHospitalField("browserUrl", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("hospital:Hospital URL"), i18next.t("hospital:Hospital URL - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined />} value={this.state.hospital.hospitalUrl} onChange={e => {
              this.updateHospitalField("hospitalUrl", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("hospital:State"), i18next.t("hospital:State - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.hospital.state} onChange={value => {
              this.updateHospitalField("state", value);
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

  submitHospitalEdit(willExist) {
    const hospital = Setting.deepCopy(this.state.hospital);
    HospitalBackend.updateHospital(this.state.hospital.owner, this.state.hospitalName, hospital)
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "Successfully saved");
            this.setState({
              hospitalName: this.state.hospital.name,
            });
            if (willExist) {
              this.props.history.push("/hospitals");
            } else {
              this.props.history.push(`/hospitals/${this.state.hospital.owner}/${encodeURIComponent(this.state.hospital.name)}`);
            }
            // this.getHospital(true);
          } else {
            Setting.showMessage("error", "failed to save: server side failure");
            this.updateHospitalField("name", this.state.hospitalName);
          }
        } else {
          Setting.showMessage("error", `failed to save: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  deleteHospital() {
    HospitalBackend.deleteHospital(this.state.hospital)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/hospitals");
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
          this.state.hospital !== null ? this.renderHospital() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" onClick={() => this.submitHospitalEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitHospitalEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} size="large" onClick={() => this.deleteHospital()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default HospitalEditPage;
