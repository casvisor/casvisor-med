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
import {Button, Table} from "antd";
import moment from "moment";
import * as Setting from "./Setting";
import * as SharingBackend from "./backend/SharingBackend";
import * as ProviderBackend from "./backend/ProviderBackend";
import i18next from "i18next";
import BaseListPage from "./BaseListPage";
import PopconfirmModal from "./common/modal/PopconfirmModal";

class SharingListPage extends BaseListPage {
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

  newSharing() {
    return {
      owner: this.props.account.owner,
      name: `sharing_${Setting.getRandomName()}`,
      createdTime: moment().format(),
      updatedTime: moment().format(),
      displayName: `New Sharing - ${Setting.getRandomName()}`,
      dataOwner: "",
      authorizedUser: "",
      datasetId: "",
      dataDiscription: "",
      dataDigest: "",
      dataSignature: "",
      taskId: "",
      taskDescription: "",
      taskDigest: "",
      taskSignature: "",
      teeProvider: "",
      attestId: "",
      signerId: "",
      totalCount: "0",
      leftCount: "0",
      expireTime: "",
      usageBlock: "",
      avaliable: "true",
    };
  }

  addSharing() {
    const newSharing = this.newSharing();
    SharingBackend.addSharing(newSharing)
      .then((res) => {
        if (res.status === "ok") {
          this.props.history.push({
            pathname: `/sharings/${newSharing.owner}/${newSharing.name}`,
            mode: "add",
          });
          Setting.showMessage("success", "Sharing added successfully");
        } else {
          Setting.showMessage("error", `Failed to add Sharing: ${res.msg}`);
        }
      })
      .catch((error) => {
        Setting.showMessage("error", `Sharing failed to add: ${error}`);
      });
  }

  deleteSharing(i) {
    SharingBackend.deleteSharing(this.state.data[i])
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "Sharing deleted successfully");
          this.setState({
            data: Setting.deleteRow(this.state.data, i),
            pagination: {
              ...this.state.pagination,
              total: this.state.pagination.total - 1,
            },
          });
        } else {
          Setting.showMessage("error", `Failed to delete Sharing: ${res.msg}`);
        }
      })
      .catch((error) => {
        Setting.showMessage("error", `Sharing failed to delete: ${error}`);
      });
  }

  commitSharing(i) {
    SharingBackend.commitSharing(this.state.data[i])
      .then((res) => {
        if (res.status === "ok") {
          Setting.showMessage("success", "Sharing committed successfully");
          this.fetch({
            pagination: this.state.pagination,
          });
        } else {
          Setting.showMessage("error", `Failed to commit Sharing: ${res.msg}`);
        }
      })
      .catch((error) => {
        Setting.showMessage("error", `Sharing failed to commit: ${error}`);
      });
  }

  querySharing(sharing) {
    SharingBackend.querySharing(sharing.owner, sharing.name).then((res) => {
      if (res.status === "ok") {
        Setting.showMessage(
          res.data.includes("Mismatched") ? "error" : "success",
          `${res.data}`
        );
      } else {
        Setting.showMessage("error", `Failed to query sharing: ${res.msg}`);
      }
    });
  }

  renderTable(sharings) {
    const columns = [
      {
        title: i18next.t("general:Organization"),
        dataIndex: "organization",
        key: "organization",
        width: "110px",
        sorter: true,
        ...this.getColumnSearchProps("organization"),
        render: (text, sharing, index) => {
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
        title: i18next.t("general:Name"),
        dataIndex: "name",
        key: "name",
        width: "300px",
        sorter: true,
        ...this.getColumnSearchProps("name"),
        render: (text, sharing, index) => {
          return (
            <Link to={`/sharings/${sharing.owner}/${sharing.name}`}>
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
        render: (text, sharing, index) => {
          return Setting.getFormattedDate(text);
        },
      },
      {
        title: i18next.t("general:Data Owner"),
        dataIndex: "dataOwner",
        key: "dataOwner",
        width: "120px",
        sorter: true,
        ...this.getColumnSearchProps("dataOwner"),
        render: (text, sharing, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={Setting.getMyProfileUrl(this.props.account).replace("/account", `/users/${sharing.ownerOrganization}/${sharing.dataOwner}`)}>
              {text}
            </a>
          );
        },
      },
      {
        title: i18next.t("general:Data User"),
        dataIndex: "authorizedUser",
        key: "authorizedUser",
        width: "120px",
        sorter: true,
        ...this.getColumnSearchProps("authorizedUser"),
        render: (text, sharing, index) => {
          return (
            <a target="_blank" rel="noreferrer" href={Setting.getMyProfileUrl(this.props.account).replace("/account", `/users/${sharing.userOrganization}/${sharing.dataUser}`)}>
              {text}
            </a>
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
        title: i18next.t("general:Data Description"),
        dataIndex: "dataDiscription",
        key: "dataDiscription",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("dataDiscription"),
      },
      {
        title: i18next.t("general:Data Digest"),
        dataIndex: "dataDigest",
        key: "dataDigest",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("dataDigest"),
      },
      {
        title: i18next.t("general:Data Signature"),
        dataIndex: "dataSignature",
        key: "dataSignature",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("dataSignature"),
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
        title: i18next.t("general:Task Description"),
        dataIndex: "taskDescription",
        key: "taskDescription",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("taskDescription"),
      },
      {
        title: i18next.t("general:Task Digest"),
        dataIndex: "taskDigest",
        key: "taskDigest",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("taskDigest"),
      },
      {
        title: i18next.t("general:Task Signature"),
        dataIndex: "taskSignature",
        key: "taskSignature",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("taskSignature"),
      },
      {
        title: i18next.t("general:TEE Provider"),
        dataIndex: "teeProvider",
        key: "teeProvider",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("teeProvider"),
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
        title: i18next.t("general:Signer ID"),
        dataIndex: "signerId",
        key: "signerId",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("signerId"),
      },
      {
        title: i18next.t("general:Total Count"),
        dataIndex: "totalCount",
        key: "totalCount",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("totalCount"),
      },
      {
        title: i18next.t("general:Left Count"),
        dataIndex: "leftCount",
        key: "leftCount",
        width: "150px",
        sorter: true,
        ...this.getColumnSearchProps("leftCount"),
      },
      {
        title: i18next.t("general:Expire Time"),
        dataIndex: "expireTime",
        key: "expireTime",
        width: "150px",
        sorter: true,
        render: (text) => Setting.getFormattedDate(text),
      },
      {
        title: i18next.t("general:TEE Provider"),
        dataIndex: "teeProvider",
        key: "teeProvider",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("teeProvider"),
        render: (text, sharing, index) => {
          return (
            <Link to={`/providers/${sharing.owner}/${text}`}>
              {
                Setting.getShortText(text, 25)
              }
            </Link>
          );
        },
      },
      {
        title: i18next.t("general:Blockchain Provider"),
        dataIndex: "chainProvider",
        key: "chainProvider",
        width: "90px",
        sorter: true,
        ...this.getColumnSearchProps("chainProvider"),
        render: (text, sharing, index) => {
          return (
            <Link to={`/providers/${sharing.owner}/${text}`}>
              {
                Setting.getShortText(text, 25)
              }
            </Link>
          );
        },
      },
      {
        title: i18next.t("general:Avaliable"),
        dataIndex: "avaliable",
        key: "avaliable",
        width: "150px",
        sorter: (a, b) => a.state.localeCompare(b.state),
      },
      {
        title: i18next.t("general:Usage Block"),
        dataIndex: "usageBlock",
        key: "usageBlock",
        width: "90px",
        sorter: true,
        fixed: Setting.isMobile() ? "false" : "right",
        ...this.getColumnSearchProps("usageBlock"),
        render: (text, sharing, index) => {
          return Setting.getBlockBrowserUrl(
            this.state.providerMap,
            sharing.chainProvider,
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
        render: (text, sharing, index) => {
          return (
            <div>
              <Button
                disabled={sharing.usageBlock === ""}
                style={{marginTop: "10px", marginRight: "10px"}}
                type="primary"
                danger
                onClick={() => this.querySharing(index)}
              >
                {i18next.t("sharing:Query")}
              </Button>
              <Button
                // disabled={sharing.owner !== this.props.account.owner}
                style={{
                  marginTop: "10px",
                  marginBottom: "10px",
                  marginRight: "10px",
                }}
                onClick={() =>
                  this.props.history.push(
                    `/sharings/${sharing.owner}/${sharing.name}`
                  )
                }
              >
                {i18next.t("general:View")}
              </Button>
              <PopconfirmModal
                // disabled={sharing.owner !== this.props.account.owner}
                fakeDisabled={true}
                title={
                  i18next.t("general:Sure to delete") + `: ${sharing.name} ?`
                }
                onConfirm={() => this.deleteSharing(index)}
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
          dataSource={sharings}
          rowKey={(sharing) => `${sharing.owner}/${sharing.name}`}
          size="middle"
          bordered
          pagination={paginationProps}
          title={() => (
            <div>
              {i18next.t("general:Sharings")}&nbsp;&nbsp;&nbsp;&nbsp;
              <Button type="primary" size="small" onClick={this.addSharing.bind(this)}>{i18next.t("general:Add")}</Button>
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
    SharingBackend.getSharings(
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

export default SharingListPage;
