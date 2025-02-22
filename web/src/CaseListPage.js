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
import { Link } from "react-router-dom";
import { Button, Switch, Table } from "antd";
import BaseListPage from "./BaseListPage";
import moment from "moment";
import * as Setting from "./Setting";
import * as CaseBackend from "./backend/CaseBackend";
import i18next from "i18next";
import PopconfirmModal from "./common/modal/PopconfirmModal";
import ConnectModal from "./common/modal/ConnectModal";

class CaseListPage extends BaseListPage {
  constructor(props) {
    super(props);
  }

  newCase() {
    return {
      owner: this.props.account.owner,
      name: `case_${Setting.getRandomName()}`,
      createdTime: moment().format(),
      updatedTime: moment().format(),
      displayName: `New Case - ${Setting.getRandomName()}`,
      symptoms: "",
      diagnosis: "",
      diagnosisDate: moment().format(),
      prescription: "",
      followUp: "",
      // symptomHash: "",
      // leaveDataHash: "",
      // ordersHash: "",
      variation: false,
      HISInterfaceInfo: "",
      primaryCarePhysician: "",
      type: "",
      patientName: "",
      doctorName: "",
      specialistAllianceID: "",
      integratedCareOrganizationID: "",
    };
  }

  addCase() {
    const newCase = this.newCase();
    CaseBackend.addCase(newCase)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push({ pathname: `/cases/${newCase.owner}/${newCase.name}`, mode: "add" });
          Setting.showMessage("success", "Case added successfully");
        } else {
          Setting.showMessage("error", `Failed to add Case: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `Case failed to add: ${error}`);
      });
  }

  deleteCase(i) {
    CaseBackend.deleteCase(this.state.data[i])
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "Case deleted successfully");
          this.setState({
            data: Setting.deleteRow(this.state.data, i),
            pagination: {
              ...this.state.pagination,
              total: this.state.pagination.total - 1,
            },
          });
        } else {
          Setting.showMessage("error", `Failed to delete Case: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `Case failed to delete: ${error}`);
      });
  }

  renderTable(cases) {
    const columns = [
      {
        title: i18next.t("general:Organization"),
        dataIndex: "owner",
        key: "owner",
        width: "110px",
        sorter: true,
        ...this.getColumnSearchProps("owner"),
        render: (text, case, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={Setting.getMyProfileUrl(this.props.account).replace("/account", `/organizations/${text}`)}>
              {text}
            </a>
          );
        },
      },
      {
        title: i18next.t("general:Name"),
        dataIndex: "name",
        key: "name",
        width: "120px",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, record, index) => {
          return (
            <Link to={`/cases/${record.owner}/${record.name}`}>{text}</Link>
          );
        },
      },
      {
        title: i18next.t("general:Created time"),
        dataIndex: "createdTime",
        key: "createdTime",
        width: "160px",
        // sorter: true,
        sorter: (a, b) => a.createdTime.localeCompare(b.createdTime),
        render: (text, case, index) => {
          return Setting.getFormattedDate(text);
        },
      },
      {
        title: i18next.t("general:Symptoms"),
        dataIndex: "symptoms",
        key: "symptoms",
        // width: '200px',
        sorter: (a, b) => a.symptoms.localeCompare(b.symptoms),
      },
      {
        title: i18next.t("general:Diagnosis"),
        dataIndex: "diagnosis",
        key: "diagnosis",
        sorter: (a, b) => a.diagnosis.localeCompare(b.diagnosis),
      },
      {
        title: i18next.t("general:Diagnosis Date"),
        dataIndex: "diagnosisDate",
        key: "diagnosisDate",
        sorter: (a, b) => a.diagnosisDate.localeCompare(b.diagnosisDate),
        render: (text, case, index) => {
          return Setting.getFormattedDate(text);
        },
      },
      {
        title: i18next.t("general:Prescription"),
        dataIndex: "prescription",
        key: "prescription",
        sorter: (a, b) => a.prescription.localeCompare(b.prescription),
      },
      {
        title: i18next.t("general:Follow Up"),
        dataIndex: "followUp",
        key: "followUp",
        sorter: (a, b) => a.followUp.localeCompare(b.followUp),
      },
      {
        title: i18next.t("general:Variation"),
        dataIndex: "variation",
        key: "variation",
        sorter: (a, b) => a.variation - b.variation,
        render: (text) => <Switch checked={text} disabled />,
      },
      {
        title: i18next.t("general:HIS Interface Info"),
        dataIndex: "HISInterfaceInfo",
        key: "HISInterfaceInfo",
        sorter: (a, b) => a.HISInterfaceInfo.localeCompare(b.HISInterfaceInfo),
      },
      {
        title: i18next.t("general:Primary Care Physician"),
        dataIndex: "primaryCarePhysician",
        key: "primaryCarePhysician",
        sorter: (a, b) => a.primaryCarePhysician.localeCompare(b.primaryCarePhysician),
      },
      {
        title: i18next.t("general:Type"),
        dataIndex: "type",
        key: "type",
        sorter: (a, b) => a.type.localeCompare(b.type),
      },
      {
        title: i18next.t("general:Patient Name"),
        dataIndex: "patientName",
        key: "patientName",
        sorter: (a, b) => a.patientName.localeCompare(b.patientName),
      },
      {
        title: i18next.t("general:Doctor Name"),
        dataIndex: "doctorName",
        key: "doctorName",
        sorter: (a, b) => a.doctorName.localeCompare(b.doctorName),
      },
      {
        title: i18next.t("general:Specialist Alliance ID"),
        dataIndex: "specialistAllianceID",
        key: "specialistAllianceID",
        sorter: (a, b) => a.specialistAllianceID.localeCompare(b.specialistAllianceID),
      },
      {
        title: i18next.t("general:Integrated Care Organization ID"),
        dataIndex: "integratedCareOrganizationID",
        key: "integratedCareOrganizationID",
        sorter: (a, b) => a.integratedCareOrganizationID.localeCompare(b.integratedCareOrganizationID),
      },
      {
        title: i18next.t("general:Action"),
        dataIndex: "action",
        key: "action",
        width: "260px",
        fixed: (Setting.isMobile()) ? "false" : "right",
        render: (text, case, index) => {
          return (
            <div>
              <ConnectModal
                disabled={case.owner !== this.props.account.owner}
                owner = {case.owner}
                name = {case.name}
                // category = {case.category}
              />
              <Button
                style={{marginTop: "10px", marginBottom: "10px", marginRight: "10px"}}
                onClick={() => this.props.history.push(`/cases/${case.owner}/${case.name}`)}
              >{i18next.t("general:Edit")}
              </Button>
              <PopconfirmModal
                disabled={case.owner !== this.props.account.owner}
                title={i18next.t("general:Sure to delete") + `: ${case.name} ?`}
                onConfirm={() => this.deleteCase(index)}
              >
              </PopconfirmModal>
            </div>
          );
        },
      },
    ];

    const paginationProps = {
      pageSize: this.state.pagination.pageSize,
      total: this.state.pagination.total,
      showQuickJumper: true,
      showSizeChanger: true,
      showTotal: () => i18next.t("general:{total} in total").replace("{total}", this.state.pagination.total),
    };

    return (
      <div>
        <Table scroll={{x: "max-content"}} columns={columns} dataSource={cases} rowKey={(case) => `${case.owner}/${case.name}`} size="middle" bordered pagination={paginationProps}
          title={() => (
            <div>
              {i18next.t("general:Cases")}&nbsp;&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="small" onClick={this.addCase.bind(this)}>{i18next.t("general:Add")}</Button>
            </div>
          )}
          loading={this.state.loading}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }

  fetch = (params = {}) => {
    let field = params.searchedColumn, value = params.searchText;
    const sortField = params.sortField, sortOrder = params.sortOrder;
    if (params.type !== undefined && params.type !== null) {
      field = "type";
      value = params.type;
    }
    this.setState({loading: true});
    CaseBackend.getCases(Setting.getRequestOrganization(this.props.account), params.pagination.current, params.pagination.pageSize, field, value, sortField, sortOrder)
      .then((res) => {
        this.setState({
          loading: false,
        });
        if (res.status === "ok") {
          this.setState({
            data: res.data,
            pagination: {
              ...params.pagination,
              total: res.data2,
            },
            searchText: params.searchText,
            searchedColumn: params.searchedColumn,
          });
        } else {
          if (Setting.isResponseDenied(res)) {
            this.setState({
              isAuthorized: false,
            });
          } else {
            Setting.showMessage("error", res.msg);
          }
        }
      });
  };
}

export default CaseListPage;
