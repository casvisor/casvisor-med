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
import {Link} from "react-router-dom";
import {Button, Switch, Table} from "antd";
import moment from "moment";
import * as Setting from "./Setting";
import * as ConsumerBackend from "./backend/ConsumerBackend";
import * as ProviderBackend from "./backend/ProviderBackend";
import i18next from "i18next";
import BaseListPage from "./BaseListPage";
import PopconfirmModal from "./common/modal/PopconfirmModal";

class ConsumerListPage extends BaseListPage {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      providerMap: {},
    };
  }

  componentDidMount() {
    this.getProviders();
  }

  getProviders() {
    ProviderBackend.getProviders(this.props.account.owner).then((res) => {
      if (res.status === "ok") {
        const providerMap = {};
        for (const provider of res.data) {
          providerMap[provider.name] = provider;
        }
        this.setState({
          providerMap: providerMap,
        });
      } else {
        Setting.showMessage("error", res.msg);
      }
    });
  }

  newConsumer() {
    return {
      owner: this.props.account.owner,
      name: Setting.GenerateId(),
      createdTime: moment().format(),
      chainProvider: "",
      user: this.props.account.name,
      teeProvider: "",
      datasetId: "",
      attestId: "",
      taskId: "",
      signerId: "",
      isRun: false,
    };
  }

  addConsumer() {
    const newConsumer = this.newConsumer();
    ConsumerBackend.addConsumer(newConsumer)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push({
            pathname: `/consumers/${newConsumer.owner}/${newConsumer.name}`,
            mode: "add",
          });
          Setting.showMessage("success", "Consumer added successfully");
        } else {
          Setting.showMessage("error", `Failed to add Consumer: ${res.msg}`);
        }
      })
      .catch((error) => {
        Setting.showMessage("error", `Consumer failed to add: ${error}`);
      });
  }

  deleteConsumer(i) {
    ConsumerBackend.deleteConsumer(this.state.data[i])
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "Consumer deleted successfully");
          this.setState({
            data: Setting.deleteRow(this.state.data, i),
            pagination: {
              ...this.state.pagination,
              total: this.state.pagination.total - 1,
            },
          });
        } else {
          Setting.showMessage("error", `Failed to delete Consumer: ${res.msg}`);
        }
      })
      .catch((error) => {
        Setting.showMessage("error", `Consumer failed to delete: ${error}`);
      });
  }

  commitConsumer(i) {
    ConsumerBackend.commitConsumer(this.state.data[i])
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "Consumer committed successfully");
          this.fetch({
            pagination: this.state.pagination,
          });
        } else {
          Setting.showMessage("error", `Failed to commit Consumer: ${res.msg}`);
        }
      })
      .catch((error) => {
        Setting.showMessage("error", `Consumer failed to commit: ${error}`);
      });
  }

  queryConsumer(consumer) {
    ConsumerBackend.queryConsumer(consumer.owner, consumer.name).then((res) => {
      if (res.status === "ok") {
        Setting.showMessage(
          res.data.includes("Mismatched") ? "error" : "success",
          `${res.data}`
        );
      } else {
        Setting.showMessage("error", `Failed to query consumer: ${res.msg}`);
      }
    });
  }

  renderTable(consumers) {
    const columns = [
      {
        title: i18next.t("general:Organization"),
        dataIndex: "organization",
        key: "organization",
        width: "110px",
        sorter: true,
        ...this.getColumnSearchProps("organization"),
        render: (text, consumer, index) => {
          return (
            <a
              target="_blank"
              rel="noreferrer"
              href={Setting.getMyProfileUrl(this.props.account).replace(
                "/account",
                `/organizations/${text}`
              )}
            >
              {text}
            </a>
          );
        },
      },
      {
        title: i18next.t("general:ID"),
        dataIndex: "id",
        key: "id",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("id"),
      },
      {
        title: i18next.t("general:Name"),
        dataIndex: "name",
        key: "name",
        width: "300px",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, consumer, index) => {
          return (
            <Link to={`/consumers/${consumer.organization}/${consumer.name}`}>
              {text}
            </Link>
          );
        },
      },
      {
        title: i18next.t("general:Created time"),
        dataIndex: "createdTime",
        key: "createdTime",
        width: "150px",
        sorter: true,
        render: (text, consumer, index) => {
          return Setting.getFormattedDate(text);
        },
      },
      {
        title: i18next.t("general:Blockchain Provider"),
        dataIndex: "chainProvider",
        key: "chainProvider",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("chainProvider"),
        render: (text, consumer, index) => {
          return (
            <Link to={`/providers/${consumer.owner}/${text}`}>
              {
                Setting.getShortText(text, 25)
              }
            </Link>
          );
        },
      },
      {
        title: i18next.t("general:User"),
        dataIndex: "user",
        key: "user",
        width: "120px",
        sorter: true,
        ...this.getColumnSearchProps("user"),
        render: (text, consumer, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={Setting.getMyProfileUrl(this.props.account).replace("/account", `/users/${consumer.organization}/${consumer.user}`)}>
              {text}
            </a>
          );
        },
      },
      {
        title: i18next.t("general:TEE Provider"),
        dataIndex: "teeProvider",
        key: "teeProvider",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("teeProvider"),
        render: (text, consumer, index) => {
          return (
            <Link to={`/providers/${consumer.owner}/${text}`}>
              {
                Setting.getShortText(text, 25)
              }
            </Link>
          );
        },
      },
      {
        title: i18next.t("general:Dataset ID"),
        dataIndex: "datasetId",
        key: "datasetId",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("datasetId"),
      },
      {
        title: i18next.t("general:Attest ID"),
        dataIndex: "attestId",
        key: "attestId",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("attestId"),
      },
      {
        title: i18next.t("general:Task ID"),
        dataIndex: "taskId",
        key: "taskId",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("taskId"),
      },
      {
        title: i18next.t("general:Signer ID"),
        dataIndex: "signerId",
        key: "signerId",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("signerId"),
      },
      {
        title: i18next.t("consumer:Response"),
        dataIndex: "response",
        key: "response",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("response"),
      },
      {
        title: i18next.t("consumer:Object"),
        dataIndex: "object",
        key: "object",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("object"),
      },
      {
        title: i18next.t("general:Result"),
        dataIndex: "result",
        key: "result",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("result"),
      },
      {
        title: i18next.t("general:Is run"),
        dataIndex: "isRun",
        key: "isRun",
        width: "140px",
        sorter: true,
        render: (text, consumer, index) => {
          if (
            !["signup", "login", "logout", "update-user"].includes(
              consumer.action
            )
          ) {
            return null;
          }

          return (
            <Switch
              disabled
              checkedChildren="ON"
              unCheckedChildren="OFF"
              checked={text}
            />
          );
        },
      },
      {
        title: i18next.t("general:Block"),
        dataIndex: "block",
        key: "block",
        width: "90px",
        sorter: true,
        fixed: Setting.isMobile() ? "false" : "right",
        ...this.getColumnSearchProps("block"),
        render: (text, consumer, index) => {
          return Setting.getBlockBrowserUrl(
            this.state.providerMap,
            consumer.provider,
            text
          );
        },
      },
      {
        title: i18next.t("general:Action"),
        dataIndex: "action",
        key: "action",
        width: "270px",
        fixed: Setting.isMobile() ? "false" : "right",
        render: (text, consumer, index) => {
          return (
            <div>
              {consumer.block === "" ? (
                <Button
                  disabled={consumer.block !== ""}
                  style={{marginTop: "10px", marginRight: "10px"}}
                  type="primary"
                  danger
                  onClick={() => this.commitConsumer(index)}
                >
                  {i18next.t("consumer:Commit")}
                </Button>
              ) : (
                <Button
                  disabled={consumer.block === ""}
                  style={{marginTop: "10px", marginRight: "10px"}}
                  type="primary"
                  onClick={() => this.queryConsumer(consumer)}
                >
                  {i18next.t("consumer:Query")}
                </Button>
              )}
              <Button
                // disabled={consumer.owner !== this.props.account.owner}
                style={{
                  marginTop: "10px",
                  marginBottom: "10px",
                  marginRight: "10px",
                }}
                onClick={() =>
                  this.props.history.push(
                    `/consumers/${consumer.owner}/${consumer.name}`
                  )
                }
              >
                {i18next.t("general:View")}
              </Button>
              <PopconfirmModal
                // disabled={consumer.owner !== this.props.account.owner}
                fakeDisabled={true}
                title={
                  i18next.t("general:Sure to delete") + `: ${consumer.name} ?`
                }
                onConfirm={() => this.deleteConsumer(index)}
              ></PopconfirmModal>
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
      showTotal: () =>
        i18next
          .t("general:{total} in total")
          .replace("{total}", this.state.pagination.total),
    };

    return (
      <div>
        <Table
          scroll={{x: "max-content"}}
          columns={columns}
          dataSource={consumers}
          rowKey={(consumer) => `${consumer.owner}/${consumer.name}`}
          size="middle"
          bordered
          pagination={paginationProps}
          title={() => (
            <div>
              {i18next.t("general:Consumers")}&nbsp;&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="small" onClick={this.addConsumer.bind(this)}>{i18next.t("general:Add")}</Button>
            </div>
          )}
          loading={this.state.loading}
          onChange={this.handleTableChange}
        />
      </div>
    );
  }

  fetch = (params = {}) => {
    let field = params.searchedColumn,
      value = params.searchText;
    const sortField = params.sortField,
      sortOrder = params.sortOrder;
    if (params.type !== undefined && params.type !== null) {
      field = "type";
      value = params.type;
    }
    this.setState({loading: true});
    ConsumerBackend.getConsumers(
      Setting.getRequestOrganization(this.props.account),
      params.pagination.current,
      params.pagination.pageSize,
      field,
      value,
      sortField,
      sortOrder
    ).then((res) => {
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

export default ConsumerListPage;
