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

import React, {Component} from "react";
import {Link, Redirect, Route, Switch, withRouter} from "react-router-dom";
import {StyleProvider, legacyLogicalPropertiesTransformer} from "@ant-design/cssinjs";
import {Avatar, Button, Card, ConfigProvider, Drawer, Dropdown, FloatButton, Layout, Menu} from "antd";
import {BarsOutlined, DownOutlined, LogoutOutlined, SettingOutlined} from "@ant-design/icons";
import "./App.less";
import * as Setting from "./Setting";
import * as AccountBackend from "./backend/AccountBackend";
import AuthCallback from "./AuthCallback";
import * as Conf from "./Conf";
import SigninPage from "./SigninPage";
import i18next from "i18next";
import {withTranslation} from "react-i18next";
import LanguageSelect from "./LanguageSelect";
import AssetListPage from "./AssetListPage";
import AssetEditPage from "./AssetEditPage";
import ProviderListPage from "./ProviderListPage";
import ProviderEditPage from "./ProviderEditPage";
import MachineListPage from "./MachineListPage";
import MachineEditPage from "./MachineEditPage";
import SessionListPage from "./SessionListPage";
import RecordListPage from "./RecordListPage";
import RecordEditPage from "./RecordEditPage";
import ShortcutsPage from "./basic/ShortcutsPage";
import AssetWorkbench from "./AssetWorkbench";
import AccessPage from "./component/access/AccessPage";
import CaaseListPage from "./CaaseListPage";
import CaaseEditPage from "./CaaseEditPage";
import ConsultationListPage from "./ConsultationListPage";
import ConsultationEditPage from "./ConsultationEditPage";
import DoctorListPage from "./DoctorListPage";
import DoctorEditPage from "./DoctorEditPage";
import HospitalListPage from "./HospitalListPage";
import HospitalEditPage from "./HospitalEditPage";
import LearningListPage from "./LearningListPage";
import LearningEditPage from "./LearningEditPage";
import PatientListPage from "./PatientListPage";
import PatientEditPage from "./PatientEditPage";
import SharingListPage from "./SharingListPage";
import SharingEditPage from "./SharingEditPage";
import AuditPage from "./AuditPage";
import PathsComparePage from "./PathsComparePage";

const {Header, Footer, Content} = Layout;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      classes: props,
      selectedMenuKey: location.pathname.split("/")[1],
      account: undefined,
      uri: location.pathname,
      themeData: Conf.ThemeDefault,
      menuVisible: false,
    };

    Setting.initServerUrl();
    Setting.initCasdoorSdk(Conf.AuthConfig);
  }

  UNSAFE_componentWillMount() {
    this.getAccount();
  }

  onUpdateAccount(account) {
    this.setState({
      account: account,
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const uri = location.pathname;
    if (this.state.uri !== uri) {
      this.setState({
        uri: uri,
        selectedMenuKey: uri.split("/")[1],
      });
    }
  }

  setLanguage() {
    // let language = account?.language;
    const language = localStorage.getItem("language");
    if (language !== "" && language !== i18next.language) {
      Setting.setLanguage(language);
    }
  }

  getAccount() {
    AccountBackend.getAccount()
      .then((res) => {
        const account = res.data;
        if (account !== null) {
          this.setLanguage(account);
        }

        this.setState({
          account: account,
        });
      });
  }

  signout() {
    AccountBackend.signout()
      .then((res) => {
        if (res.status === "ok") {
          this.setState({
            account: null,
          });

          Setting.showMessage("success", "Successfully signed out, redirected to homepage");
          Setting.goToLink("/");
        } else {
          Setting.showMessage("error", `Signout failed: ${res.msg}`);
        }
      });
  }

  renderAvatar() {
    if (this.state.account.avatar === "") {
      return (
        <Avatar style={{backgroundColor: Setting.getAvatarColor(this.state.account.name), verticalAlign: "middle"}} size="large">
          {Setting.getShortName(this.state.account.name)}
        </Avatar>
      );
    } else {
      return (
        <Avatar src={this.state.account.avatar} style={{verticalAlign: "middle"}} size="large">
          {Setting.getShortName(this.state.account.name)}
        </Avatar>
      );
    }
  }

  renderRightDropdown() {
    const items = [];
    items.push(Setting.getItem(<><SettingOutlined />&nbsp;&nbsp;{i18next.t("account:My Account")}</>,
      "/account"
    ));
    items.push(Setting.getItem(<><LogoutOutlined />&nbsp;&nbsp;{i18next.t("account:Sign Out")}</>,
      "/logout"
    ));
    const onClick = (e) => {
      if (e.key === "/account") {
        Setting.openLink(Setting.getMyProfileUrl(this.state.account));
      } else if (e.key === "/logout") {
        this.signout();
      }
    };

    return (
      <Dropdown key="/rightDropDown" menu={{items, onClick}} >
        <div className="rightDropDown">
          {
            this.renderAvatar()
          }
          &nbsp;
          &nbsp;
          {Setting.isMobile() ? null : Setting.getShortName(this.state.account.displayName)} &nbsp; <DownOutlined />
          &nbsp;
          &nbsp;
          &nbsp;
        </div>
      </Dropdown>
    );
  }

  renderAccountMenu() {
    if (this.state.account === undefined) {
      return null;
    } else if (this.state.account === null) {
      return (
        <React.Fragment>
          <Menu.Item key="/signup" style={{float: "right", marginRight: "20px"}}>
            <a href={Setting.getSignupUrl()}>
              {i18next.t("account:Sign Up")}
            </a>
          </Menu.Item>
          <Menu.Item key="/signin" style={{float: "right"}}>
            <a href={Setting.getSigninUrl()}>
              {i18next.t("account:Sign In")}
            </a>
          </Menu.Item>
          <Menu.Item style={{float: "right", margin: "0px", padding: "0px"}}>
            <LanguageSelect />
          </Menu.Item>
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {this.renderRightDropdown()}
          <LanguageSelect />
        </React.Fragment>
      );
    }
  }

  getMenuItems() {
    const res = [];

    if (this.state.account === null || this.state.account === undefined) {
      return [];
    }

    res.push(Setting.getItem(<Link to="/">{i18next.t("general:Home")}</Link>, ""));
    // res.push(Setting.getItem(<Link to="/assets">{i18next.t("general:Assets")}</Link>, "assets"));
    res.push(Setting.getItem(<Link to="/providers">{i18next.t("general:Providers")}</Link>, "providers"));
    res.push(Setting.getItem(<Link to="/caases">{i18next.t("general:Caases")}</Link>, "caases"));
    res.push(Setting.getItem(<Link to="/consultations">{i18next.t("general:Consultations")}</Link>, "consultations"));
    res.push(Setting.getItem(<Link to="/doctors">{i18next.t("general:Doctors")}</Link>, "doctors"));
    res.push(Setting.getItem(<Link to="/hospitals">{i18next.t("general:Hospitals")}</Link>, "hospitals"));
    res.push(Setting.getItem(<Link to="/learnings">{i18next.t("general:Learnings")}</Link>, "learnings"));
    res.push(Setting.getItem(<Link to="/patients">{i18next.t("general:Patients")}</Link>, "patients"));
    res.push(Setting.getItem(<Link to="/pathscompare">{i18next.t("general:Paths Compare")}</Link>, "pathscompare"));
    res.push(Setting.getItem(<Link to="/audit">{i18next.t("general:Audit")}</Link>, "audit"));
    res.push(Setting.getItem(<Link to="/sharings">{i18next.t("general:Sharings")}</Link>, "patients"));
    // res.push(Setting.getItem(<Link to="/machines">{i18next.t("general:Machines")}</Link>, "machines"));
    // res.push(Setting.getItem(<Link to="/sessions">{i18next.t("general:Sessions")}</Link>, "sessions"));
    res.push(Setting.getItem(<Link to="/records">{i18next.t("general:Records")}</Link>, "records"));
    // res.push(Setting.getItem(<Link to="/workbench" target="_blank">{i18next.t("general:Workbench")}</Link>, "workbench"));
    res.push(Setting.getItem(<a target="_blank" rel="noreferrer" href={Setting.isLocalhost() ? `${Setting.ServerUrl}/swagger/` : "/swagger/"}>{i18next.t("general:Swagger")}</a>, "/swagger"));

    return res;
  }

  renderHomeIfSignedIn(component) {
    if (this.state.account !== null && this.state.account !== undefined) {
      return <Redirect to="/" />;
    } else {
      return component;
    }
  }

  renderSigninIfNotSignedIn(component) {
    if (this.state.account === null) {
      sessionStorage.setItem("from", window.location.pathname);
      window.location.replace(Setting.getSigninUrl());
    } else if (this.state.account === undefined) {
      return null;
    } else {
      return component;
    }
  }

  renderRouter() {
    return (
      <Switch>
        <Route exact path="/callback" component={AuthCallback} />
        <Route exact path="/signin" render={(props) => this.renderHomeIfSignedIn(<SigninPage {...props} />)} />
        <Route exact path="/" render={(props) => this.renderSigninIfNotSignedIn(<ShortcutsPage account={this.state.account} {...props} />)} />
        <Route exact path="/assets" render={(props) => this.renderSigninIfNotSignedIn(<AssetListPage account={this.state.account} {...props} />)} />
        <Route exact path="/assets/:organizationName/:assetName" render={(props) => this.renderSigninIfNotSignedIn(<AssetEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/providers" render={(props) => this.renderSigninIfNotSignedIn(<ProviderListPage account={this.state.account} {...props} />)} />
        <Route exact path="/providers/:organizationName/:providerName" render={(props) => this.renderSigninIfNotSignedIn(<ProviderEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/caases" render={(props) => this.renderSigninIfNotSignedIn(<CaaseListPage account={this.state.account} {...props} />)} />
        <Route exact path="/caases/:organizationName/:caaseName" render={(props) => this.renderSigninIfNotSignedIn(<CaaseEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/consultations" render={(props) => this.renderSigninIfNotSignedIn(<ConsultationListPage account={this.state.account} {...props} />)} />
        <Route exact path="/consultations/:organizationName/:consultationName" render={(props) => this.renderSigninIfNotSignedIn(<ConsultationEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/doctors" render={(props) => this.renderSigninIfNotSignedIn(<DoctorListPage account={this.state.account} {...props} />)} />
        <Route exact path="/doctors/:organizationName/:doctorName" render={(props) => this.renderSigninIfNotSignedIn(<DoctorEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/hospitals" render={(props) => this.renderSigninIfNotSignedIn(<HospitalListPage account={this.state.account} {...props} />)} />
        <Route exact path="/hospitals/:organizationName/:hospitalName" render={(props) => this.renderSigninIfNotSignedIn(<HospitalEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/learnings" render={(props) => this.renderSigninIfNotSignedIn(<LearningListPage account={this.state.account} {...props} />)} />
        <Route exact path="/learnings/:organizationName/:learningName" render={(props) => this.renderSigninIfNotSignedIn(<LearningEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/patients" render={(props) => this.renderSigninIfNotSignedIn(<PatientListPage account={this.state.account} {...props} />)} />
        <Route exact path="/patients/:organizationName/:patientName" render={(props) => this.renderSigninIfNotSignedIn(<PatientEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/sharings" render={(props) => this.renderSigninIfNotSignedIn(<SharingListPage account={this.state.account} {...props} />)} />
        <Route exact path="/sharings/:organizationName/:sharingName" render={(props) => this.renderSigninIfNotSignedIn(<SharingEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/machines" render={(props) => this.renderSigninIfNotSignedIn(<MachineListPage account={this.state.account} {...props} />)} />
        <Route exact path="/machines/:organizationName/:machineName" render={(props) => this.renderSigninIfNotSignedIn(<MachineEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/sessions" render={(props) => this.renderSigninIfNotSignedIn(<SessionListPage account={this.state.account} {...props} />)} />
        <Route exact path="/records" render={(props) => this.renderSigninIfNotSignedIn(<RecordListPage account={this.state.account} {...props} />)} />
        <Route exact path="/records/:organizationName/:recordName" render={(props) => this.renderSigninIfNotSignedIn(<RecordEditPage account={this.state.account} {...props} />)} />
        <Route exact path="/access/:owner/:name" render={(props) => this.renderSigninIfNotSignedIn(<AccessPage account={this.state.account} {...props} />)} />
        <Route exact path="/workbench" render={(props) => this.renderSigninIfNotSignedIn(<AssetWorkbench account={this.state.account} {...props} />)} />
        <Route exact path="/audit" render={(props) => this.renderSigninIfNotSignedIn(<AuditPage account={this.state.account} {...props} />)} />
        <Route exact path="/pathscompare" render={(props) => this.renderSigninIfNotSignedIn(<PathsComparePage account={this.state.account} {...props} />)} />

      </Switch>
    );
  }

  isWithoutCard() {
    return Setting.isMobile() || this.isHiddenHeaderAndFooter() || window.location.pathname === "/chat";
  }

  isHiddenHeaderAndFooter(uri) {
    if (uri === undefined) {
      uri = this.state.uri;
    }
    const hiddenPaths = ["/workbench", "/access"];
    for (const path of hiddenPaths) {
      if (uri.startsWith(path)) {
        return true;
      }
    }
  }

  renderContent() {
    return (
      <Layout id="parent-area">
        {this.renderHeader()}
        <Content style={{display: "flex", flexDirection: "column"}}>
          {this.isWithoutCard() ?
            this.renderRouter() :
            <Card className="content-warp-card">
              {this.renderRouter()}
            </Card>
          }
        </Content>
        {this.renderFooter()}
      </Layout>
    );
  }

  renderHeader() {
    if (this.isHiddenHeaderAndFooter()) {
      return null;
    }

    const showMenu = () => {
      this.setState({
        menuVisible: true,
      });
    };

    const onClick = ({key}) => {
      if (Setting.isMobile()) {
        this.setState({
          menuVisible: false,
        });
      }

      this.setState({
        uri: location.pathname,
        selectedMenuKey: key,
      });
    };

    const menuStyleRight = !Setting.isMobile() ? "calc(180px + 260px)" : "260px";

    return (
      <Header style={{padding: "0", marginBottom: "3px", backgroundColor: "white"}}>
        {Setting.isMobile() ? null : (
          <Link to={"/"}>
            <div className="logo" />
          </Link>
        )}
        {Setting.isMobile() ? (
          <React.Fragment>
            <Drawer title={i18next.t("general:Close")} placement="left" visible={this.state.menuVisible} onClose={this.onClose}>
              <Menu
                items={this.getMenuItems()}
                mode={"inline"}
                selectedKeys={[this.state.selectedMenuKey]}
                style={{lineHeight: "64px"}}
                onClick={onClick}
              >
              </Menu>
            </Drawer>
            <Button icon={<BarsOutlined />} onClick={showMenu} type="text">
              {i18next.t("general:Menu")}
            </Button>
          </React.Fragment>
        ) : (
          <Menu
            onClick={onClick}
            items={this.getMenuItems()}
            mode={"horizontal"}
            selectedKeys={[this.state.selectedMenuKey]}
            style={{position: "absolute", left: "145px", right: menuStyleRight}}
          />
        )}
        {this.renderAccountMenu()}
      </Header>
    );
  }

  renderFooter() {
    if (this.isHiddenHeaderAndFooter()) {
      return null;
    }

    // How to keep your footer where it belongs ?
    // https://www.freecodecamp.org/news/how-to-keep-your-footer-where-it-belongs-59c6aa05c59c/

    return (
      <React.Fragment>
        <Footer id="footer" style={
          {
            borderTop: "1px solid #e8e8e8",
            backgroundColor: "#f5f5f5",
            textAlign: "center",
          }
        }>
          Powered by <a target="_blank" href="https://github.com/casvisor/casvisor" rel="noreferrer"><img style={{paddingBottom: "3px"}} height={"20px"} alt={"Casvisor"} src={`${Setting.StaticBaseUrl}/img/casvisor-logo_1200x256.png`} /></a>
        </Footer>
      </React.Fragment>
    );
  }

  renderPage() {
    return (
      <React.Fragment>
        {/* { */}
        {/*   this.renderBanner() */}
        {/* } */}
        <FloatButton.BackTop />
        {/* <CustomGithubCorner />*/}
        {
          this.renderContent()
        }
      </React.Fragment>
    );
  }

  render() {
    return (
      <React.Fragment>
        <ConfigProvider theme={{
          token: {
            colorPrimary: this.state.themeData.colorPrimary,
            colorInfo: this.state.themeData.colorPrimary,
            borderRadius: this.state.themeData.borderRadius,
          },
          // algorithm: Setting.getAlgorithm(this.state.themeAlgorithm),
        }}>
          <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
            {
              this.renderPage()
            }
          </StyleProvider>
        </ConfigProvider>
      </React.Fragment>
    );
  }
}

export default withRouter(withTranslation()(App));
