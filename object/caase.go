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

package object

import (
	"fmt"

	"github.com/casvisor/casvisor/util"
	"xorm.io/core"
)

type Caase struct {
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
	Variation bool `xorm:"bool" json:"variation"`
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

func GetCaaseCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Caase{})
}

func GetCaases(owner string) ([]*Caase, error) {
	caases := []*Caase{}
	err := adapter.engine.Desc("created_time").Find(&caases, &Caase{Owner: owner})
	if err != nil {
		return caases, err
	}

	return caases, nil
}

func GetPaginationCaases(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Caase, error) {
	caases := []*Caase{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&caases)
	if err != nil {
		return caases, err
	}

	return caases, nil
}

func getCaase(owner string, name string) (*Caase, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	caase := Caase{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&caase)
	if err != nil {
		return &caase, err
	}

	if existed {
		return &caase, nil
	} else {
		return nil, nil
	}
}

func GetCaase(id string) (*Caase, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getCaase(owner, name)
}

func GetMaskedCaase(caase *Caase, errs ...error) (*Caase, error) {
	if len(errs) > 0 && errs[0] != nil {
		return nil, errs[0]
	}

	if caase == nil {
		return nil, nil
	}

	// if caase.ClientSecret != "" {
	// 	caase.ClientSecret = "***"
	// }
	return caase, nil
}

func GetMaskedCaases(caases []*Caase, errs ...error) ([]*Caase, error) {
	if len(errs) > 0 && errs[0] != nil {
		return nil, errs[0]
	}

	var err error
	for _, caase := range caases {
		caase, err = GetMaskedCaase(caase)
		if err != nil {
			return nil, err
		}
	}

	return caases, nil
}

func UpdateCaase(id string, caase *Caase) (bool, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	p, err := getCaase(owner, name)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}

	// if caase.ClientSecret == "***" {
	// 	caase.ClientSecret = p.ClientSecret
	// }

	affected, err := adapter.engine.ID(core.PK{owner, name}).AllCols().Update(caase)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func AddCaase(caase *Caase) (bool, error) {
	affected, err := adapter.engine.Insert(caase)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func DeleteCaase(caase *Caase) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{caase.Owner, caase.Name}).Delete(&Caase{})
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func (caase *Caase) getId() string {
	return fmt.Sprintf("%s/%s", caase.Owner, caase.Name)
}
