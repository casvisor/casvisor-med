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
import {Link} from "react-router-dom";
import {Button, Table} from "antd";
import BaseListPage from "./BaseListPage";
import moment from "moment";
import * as Setting from "./Setting";
import * as LearningBackend from "./backend/LearningBackend";
import i18next from "i18next";
import PopconfirmModal from "./common/modal/PopconfirmModal";

class LearningListPage extends BaseListPage {
  constructor(props) {
    super(props);
  }

  newLearning() {
    return {
      owner: this.props.account.owner,
      name: `learning_${Setting.getRandomName()}`,
      createdTime: moment().format(),
      updatedTime: moment().format(),
      displayName: `New Learning - ${Setting.getRandomName()}`,
      discription: "Model description",
      epoch: "0",
      modelPath: "/path/to/model",
      hospitalName: "Unknown",
      localBatchSize: "0",
      localEpochs: "0",
    };
  }

  addLearning() {
    const newLearning = this.newLearning();
    LearningBackend.addLearning(newLearning)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push({pathname: `/learnings/${newLearning.owner}/${newLearning.name}`, mode: "add"});
          Setting.showMessage("success", "Learning added successfully");
        } else {
          Setting.showMessage("error", `Failed to add Learning: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `Learning failed to add: ${error}`);
      });
  }

  deleteLearning(i) {
    LearningBackend.deleteLearning(this.state.data[i])
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "Learning deleted successfully");
          this.setState({
            data: Setting.deleteRow(this.state.data, i),
            pagination: {
              ...this.state.pagination,
              total: this.state.pagination.total - 1,
            },
          });
        } else {
          Setting.showMessage("error", `Failed to delete Learning: ${res.msg}`);
        }
      })
      .catch(error => {
        Setting.showMessage("error", `Learning failed to delete: ${error}`);
      });
  }

  renderTable(learnings) {
    const columns = [
      {
        title: i18next.t("general:Organization"),
        dataIndex: "owner",
        key: "owner",
        width: "110px",
        sorter: true,
        ...this.getColumnSearchProps("owner"),
        render: (text, learning, index) => {
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
            <Link to={`/learnings/${record.owner}/${record.name}`}>{text}</Link>
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
        render: (text, learning, index) => {
          return Setting.getFormattedDate(text);
        },
      },
      {
        title: i18next.t("general:Description"),
        dataIndex: "discription",
        key: "discription",
        width: "200px",
        sorter: (a, b) => a.discription.localeCompare(b.discription),
      },
      {
        title: i18next.t("general:Epoch"),
        dataIndex: "epoch",
        key: "epoch",
        width: "80px",
        sorter: (a, b) => a.epoch - b.epoch,
      },
      {
        title: i18next.t("general:Model path"),
        dataIndex: "modelPath",
        key: "modelPath",
        width: "200px",
        sorter: (a, b) => a.modelPath.localeCompare(b.modelPath),
      },
      {
        title: i18next.t("general:Hospital Name"),
        dataIndex: "hospitalName",
        key: "hospitalName",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("hospitalName"),
        render: (text, record, index) => {
          return (
            <Link to={`/hospitals/${record.owner}/${text}`}>
              {
                Setting.getShortText(text, 25)
              }
            </Link>
          );
        },
      },
      {
        title: i18next.t("general:Local batch size"),
        dataIndex: "localBatchSize",
        key: "localBatchSize",
        width: "150px",
        sorter: (a, b) => a.localBatchSize - b.localBatchSize,
      },
      {
        title: i18next.t("general:Local epochs"),
        dataIndex: "localEpochs",
        key: "localEpochs",
        width: "150px",
        sorter: (a, b) => a.localEpochs - b.localEpochs,
      },
      {
        title: i18next.t("general:Action"),
        dataIndex: "action",
        key: "action",
        width: "130px",
        fixed: (Setting.isMobile()) ? "false" : "right",
        render: (text, learning, index) => {
          return (
            <div>
              <Button
                style={{marginTop: "10px", marginBottom: "10px", marginRight: "10px"}}
                onClick={() => this.props.history.push(`/learnings/${learning.owner}/${learning.name}`)}
              >{i18next.t("general:Edit")}
              </Button>
              <PopconfirmModal
                disabled={learning.owner !== this.props.account.owner}
                style={{marginBottom: "10px"}}
                title={i18next.t("general:Sure to delete") + `: ${learning.name} ?`}
                onConfirm={() => this.deleteLearning(index)}
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
        <Table scroll={{x: "max-content"}} columns={columns} dataSource={learnings} rowKey={(learning) => `${learning.owner}/${learning.name}`} size="middle" bordered pagination={paginationProps}
          title={() => (
            <div>
              {i18next.t("general:Learnings")}&nbsp;&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="small" onClick={this.addLearning.bind(this)}>{i18next.t("general:Add")}</Button>
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
    LearningBackend.getLearnings(Setting.getRequestOrganization(this.props.account), params.pagination.current, params.pagination.pageSize, field, value, sortField, sortOrder)
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

export default LearningListPage;
