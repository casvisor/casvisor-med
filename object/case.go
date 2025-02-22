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

package object

import (
	"github.com/casvisor/casvisor/util"
	"xorm.io/core"
)

type Case struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`

	Symptoms      string `xorm:"varchar(100)" json:"symptoms"`
	Diagnosis     string `xorm:"varchar(100)" json:"diagnostics"`
	DiagnosisDate string `xorm:"varchar(100)" json:"diagnosticDate"`
	Prescription  string `xorm:"varchar(100)" json:"prescription"`
	FollowUp      string `xorm:"varchar(100)" json:"followUp"`

	// SymptomHash string `xorm:"varchar(100)" json:"symptomHash"`
	// HospitalizationHash  string              `xorm:"varchar(100)" json:"hospitalizationHash"`
	// LeaveDataHash string `xorm:"varchar(100)" json:"leaveDataHash"`
	// OrdersHash    string `xorm:"varchar(100)" json:"ordersHash"`
	Variation     bool   `xorm:"bool" json:"variation"`
	// ClinicalOperations   []ClinicalOperation `xorm:"varchar(256)" json:"clinicalOperations"`
	// NursingDatas         []NursingData       `xorm:"varchar(256)" json:"nursingData"`
	// MedicalOrders        []MedicalOrder      `xorm:"varchar(256)" json:"medicalOrders"`
	HISInterfaceInfo     string `xorm:"varchar(100)" json:"HISInterfaceInfo"`
	PrimaryCarePhysician string `xorm:"varchar(100)" json:"primaryCarePhysician"`
	Type                 string `xorm:"varchar(100)" json:"type"`

	PatientName string `xorm:"varchar(100)" json:"patientName"`
	DoctorName  string `xorm:"varchar(100)" json:"doctorName"`

	SpecialistAllianceID         string `xorm:"varchar(100)" json:"specialistAllianceID"`
	IntegratedCareOrganizationID string `xorm:"varchar(100)" json:"integratedCareOrganizationID"`
}

func GetCaseCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Case{})
}

func GetCases(owner string) ([]*Case, error) {
	diseaseCases := []*Case{}
	err := adapter.engine.Desc("created_time").Find(&diseaseCases, &Case{Owner: owner})
	if err != nil {
		return diseaseCases, err
	}
	return diseaseCases, nil
}

func GetPaginationCase(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Case, error) {
	diseaseCases := []*Case{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&diseaseCases)
	if err != nil {
		return diseaseCases, err
	}

	return diseaseCases, nil
}

func getCase(owner, name string) (*Case, error) {
	if owner == "" || name == "" {
		return nil, nil
	}
	diseaseCase := Case{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&diseaseCase)
	if err != nil {
		return &diseaseCase, err
	}
	if existed {
		return &diseaseCase, nil
	} else {
		return nil, nil
	}
}

func GetCase(id string) (*Case, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getCase(owner, name)
}

func UpdateCase(id string, diseaseCase *Case) (bool, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	p, err := getCase(owner, name)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}

	affected, err := adapter.engine.ID(core.PK{owner, name}).AllCols().Update(diseaseCase)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func AddCase(diseaseCase *Case) (bool, error) {
	affected, err := adapter.engine.Insert(diseaseCase)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func DeleteCase(diseaseCase *Case) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{diseaseCase.Owner, diseaseCase.Name}).Delete(&Case{})
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}
