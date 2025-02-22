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
    CaaseBackend.getCaase(this.props.account.owner, this.state.caaseName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            caase: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get caase: ${res.msg}`);
        }
      });
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
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("caase:New Caase") : i18next.t("caase:Edit Caase")}&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={() => this.submitCaaseEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitCaaseEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} onClick={() => this.deleteCaase()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={{marginLeft: "5px"}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.caase.owner} onChange={e => {
              this.updateCaaseField("owner", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.caase.name} onChange={e => {
              this.updateCaaseField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("caase:Category"), i18next.t("caase:Category - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.caase.category} onChange={value => {
              this.updateCaaseField("category", value);
              if (value === "Public Cloud") {
                this.updateCaaseField("type", "Amazon Web Services");
              } else if (value === "Private Cloud") {
                this.updateCaaseField("type", "KVM");
              } else if (value === "Blockchain") {
                this.updateCaaseField("type", "Hyperledger Fabric");
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
            <Input value={this.state.caase.clientId} onChange={e => {
              this.updateCaaseField("clientId", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Client secret"), i18next.t("general:Client secret - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.caase.clientSecret} onChange={e => {
              this.updateCaaseField("clientSecret", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Region"), i18next.t("general:Region - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input value={this.state.caase.region} onChange={e => {
              this.updateCaaseField("region", e.target.value);
            }} />
          </Col>
        </Row>
        {
          this.state.caase.category !== "Blockchain" ? null : (
            <React.Fragment>
              <Row style={{marginTop: "20px"}} >
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {Setting.getLabel(i18next.t("general:Network"), i18next.t("general:Network - Tooltip"))} :
                </Col>
                <Col span={22} >
                  <Input value={this.state.caase.network} onChange={e => {
                    this.updateCaaseField("network", e.target.value);
                  }} />
                </Col>
              </Row>
              <Row style={{marginTop: "20px"}} >
                <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
                  {Setting.getLabel(i18next.t("general:Chain"), i18next.t("general:Chain - Tooltip"))} :
                </Col>
                <Col span={22} >
                  <Input value={this.state.caase.chain} onChange={e => {
                    this.updateCaaseField("chain", e.target.value);
                  }} />
                </Col>
              </Row>
            </React.Fragment>
          )
        }
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("caase:Browser URL"), i18next.t("caase:Browser URL - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined />} value={this.state.caase.browserUrl} onChange={e => {
              this.updateCaaseField("browserUrl", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("caase:Caase URL"), i18next.t("caase:Caase URL - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input prefix={<LinkOutlined />} value={this.state.caase.caaseUrl} onChange={e => {
              this.updateCaaseField("caaseUrl", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("caase:State"), i18next.t("caase:State - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Select virtual={false} style={{width: "100%"}} value={this.state.caase.state} onChange={value => {
              this.updateCaaseField("state", value);
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

  submitCaaseEdit(willExist) {
    const caase = Setting.deepCopy(this.state.caase);
    CaaseBackend.updateCaase(this.state.caase.owner, this.state.caaseName, caase)
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
              this.props.history.push(`/caases/${this.state.caase.owner}/${encodeURIComponent(this.state.caase.name)}`);
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
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  deleteCaase() {
    CaaseBackend.deleteCaase(this.state.caase)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/caases");
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
          this.state.caase !== null ? this.renderCaase() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          <Button size="large" onClick={() => this.submitCaaseEdit(false)}>{i18next.t("general:Save")}</Button>
          <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitCaaseEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} size="large" onClick={() => this.deleteCaase()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default CaaseEditPage;
