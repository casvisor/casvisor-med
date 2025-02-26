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
import {Button, Card, Col, DatePicker, Input, Row, Switch} from "antd";
import * as SharingBackend from "./backend/SharingBackend";
import * as Setting from "./Setting";
import i18next from "i18next";
import moment from "moment";

// import {Controlled as CodeMirror} from "react-codemirror2";
import "codemirror/lib/codemirror.css";
require("codemirror/theme/material-darker.css");
require("codemirror/mode/javascript/javascript");

// const {Option} = Select;

class SharingEditPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      sharingOwner: props.match.params.organizationName,
      sharingName: props.match.params.sharingName,
      sharing: null,
      mode: props.location.mode !== undefined ? props.location.mode : "edit",
    };
  }

  UNSAFE_componentWillMount() {
    this.getSharing();
  }

  getSharing() {
    SharingBackend.getSharing(this.props.account.owner, this.state.sharingName)
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            sharing: res.data,
          });
        } else {
          Setting.showMessage("error", `Failed to get sharing: ${res.msg}`);
        }
      });
  }

  parseSharingField(key, value) {
    if ([""].includes(key)) {
      value = Setting.myParseInt(value);
    }
    return value;
  }

  updateSharingField(key, value) {
    value = this.parseSharingField(key, value);

    const sharing = this.state.sharing;
    sharing[key] = value;
    this.setState({
      sharing: sharing,
    });
  }

  renderSharing() {
    // const history = useHistory();
    return (
      <Card size="small" title={
        <div>
          {this.state.mode === "add" ? i18next.t("sharing:New Sharing") : i18next.t("sharing:View Sharing")}&nbsp;&nbsp;&nbsp;&nbsp;
          {this.state.mode !== "123" ? (
            <React.Fragment>
              <Button onClick={() => this.submitSharingEdit(false)}>{i18next.t("general:Save")}</Button>
              <Button style={{marginLeft: "20px"}} type="primary" onClick={() => this.submitSharingEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
            </React.Fragment>
          ) : (
            <Button type="primary" onClick={() => this.props.history.push("/sharings")}>{i18next.t("general:Exit")}</Button>
          )}
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} onClick={() => this.deleteSharing()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      } style={{marginLeft: "5px"}} type="inner">
        <Row style={{marginTop: "10px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Organization"), i18next.t("general:Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.owner} onChange={e => {
              // this.updateSharingField("owner", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Name"), i18next.t("general:Name - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.name} onChange={e => {
              // this.updateSharingField("name", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Blockchain Provider"), i18next.t("general:Blockchain Provider - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input disabled={false} value={this.state.sharing.chainProvider} onChange={e => {
              // this.updateRecordField("chainProvider", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}}>
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:TEE Provider"), i18next.t("general:TEE Provider - Tooltip"))} :
          </Col>
          <Col span={22}>
            <Input disabled={false} value={this.state.sharing.teeProvider} onChange={e => {
              // this.updateRecordField("teeProvider", e.target.value);
            }} />
          </Col>
        </Row>

        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Data Owner"), i18next.t("general:Data Owner - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.dataOwner} onChange={e => {
              this.updateSharingField("dataOwner", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Owner Organization"), i18next.t("general:Owner Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.ownerOrganization} onChange={e => {
              this.updateSharingField("ownerOrganization", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Authorized User"), i18next.t("general:Authorized User - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.authorizedUser} onChange={e => {
              this.updateSharingField("authorizedUser", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:User Organization"), i18next.t("general:User Organization - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.userOrganization} onChange={e => {
              this.updateSharingField("userOrganization", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Data Description"), i18next.t("general:Data Description - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.dataDiscription} onChange={e => {
              this.updateSharingField("dataDiscription", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Data Digest"), i18next.t("general:Data Digest - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.dataDigest} onChange={e => {
              this.updateSharingField("dataDigest", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Data Signature"), i18next.t("general:Data Signature - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.dataSignature} onChange={e => {
              this.updateSharingField("dataSignature", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Task Description"), i18next.t("general:Task Description - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.taskDescription} onChange={e => {
              this.updateSharingField("taskDescription", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Task Digest"), i18next.t("general:Task Digest - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.taskDigest} onChange={e => {
              this.updateSharingField("taskDigest", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Task Signature"), i18next.t("general:Task Signature - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.taskSignature} onChange={e => {
              this.updateSharingField("taskSignature", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Total Count"), i18next.t("general:Total Count - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.totalCount} onChange={e => {
              this.updateSharingField("totalCount", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Left Count"), i18next.t("general:Left Count - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.leftCount} onChange={e => {
              this.updateSharingField("leftCount", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Expire Time"), i18next.t("general:Expire Time - Tooltip"))} :
          </Col>
          <Col span={22} >
            <DatePicker
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              value={this.state.sharing.expireTime ? moment(this.state.sharing.expireTime) : null}
              onChange={(date, dateString) => {
                this.updateSharingField("expireTime", dateString);
              }}
            />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Usage Block"), i18next.t("general:Usage Block - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Input disabled={false} value={this.state.sharing.usageBlock} onChange={e => {
              this.updateSharingField("usageBlock", e.target.value);
            }} />
          </Col>
        </Row>
        <Row style={{marginTop: "20px"}} >
          <Col style={{marginTop: "5px"}} span={(Setting.isMobile()) ? 22 : 2}>
            {Setting.getLabel(i18next.t("general:Avaliable"), i18next.t("general:Avaliable - Tooltip"))} :
          </Col>
          <Col span={22} >
            <Switch disabled={false} checked={this.state.sharing.avaliable} onChange={checked => {
              this.updateSharingField("avaliable", checked);
            }}
            options={[
              {value: "Yes", label: "Yes"},
              {value: "No", label: "No"},
            ].map(item => Setting.getOption(item.label, item.value))} />
          </Col>
        </Row>
      </Card>
    );
  }

  submitSharingEdit(willExist) {
    const sharing = Setting.deepCopy(this.state.sharing);
    SharingBackend.updateSharing(this.state.sharing.owner, this.state.sharingName, sharing)
      .then((res) => {
        if (res.status === "ok") {
          if (res.data) {
            Setting.showMessage("success", "Successfully saved");
            this.setState({
              sharingName: this.state.sharing.name,
            });
            if (willExist) {
              this.props.history.push("/sharings");
            } else {
              this.props.history.push(`/sharings/${this.state.sharing.owner}/${encodeURIComponent(this.state.sharing.name)}`);
            }
          } else {
            Setting.showMessage("error", "failed to save: server side failure");
            this.updateSharingField("name", this.state.sharingName);
          }
        } else {
          Setting.showMessage("error", `failed to save: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `failed to save: ${error}`);
      });
  }

  deleteSharing() {
    SharingBackend.deleteSharing(this.state.sharing)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push("/sharings");
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
          this.state.sharing !== null ? this.renderSharing() : null
        }
        <div style={{marginTop: "20px", marginLeft: "40px"}}>
          {this.state.mode !== "123" ? (
            <React.Fragment>
              <Button size="large" onClick={() => this.submitSharingEdit(false)}>{i18next.t("general:Save")}</Button>
              <Button style={{marginLeft: "20px"}} type="primary" size="large" onClick={() => this.submitSharingEdit(true)}>{i18next.t("general:Save & Exit")}</Button>
            </React.Fragment>
          ) : (
            <Button type="primary" size="large" onClick={() => this.props.history.push("/sharings")}>{i18next.t("general:Exit")}</Button>
          )}
          {this.state.mode === "add" ? <Button style={{marginLeft: "20px"}} size="large" onClick={() => this.deleteSharing()}>{i18next.t("general:Cancel")}</Button> : null}
        </div>
      </div>
    );
  }
}

export default SharingEditPage;
