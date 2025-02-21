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
	"xorm.io/core"
)

type Patient struct {
	PatientID string `xorm:"varchar(100) pk" json:"patientID"`
	Name      string `xorm:"varchar(100)" json:"name"`
	Gender    string `xorm:"varchar(100)" json:"gender"`
	Address   string `xorm:"varchar(100)" json:"address"`
	Email     string `xorm:"varchar(100)" json:"email"`

	BloodType string `xorm:"varchar(100)" json:"bloodType"`
	Allergies string `xorm:"varchar(100)" json:"allergies"`

	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`
}

func GetPatientCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Patient{})
}

func GetPatients() ([]*Patient, error) {
	patients := []*Patient{}
	err := adapter.engine.Desc("created_time").Find(&patients, &Patient{})
	if err != nil {
		return patients, err
	}
	return patients, nil
}

func GetPaginationPatient(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Patient, error) {
	patients := []*Patient{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&patients)
	if err != nil {
		return patients, err
	}

	return patients, nil
}

func GetPatient(patientID string) (*Patient, error) {
	if patientID == "" {
		return nil, nil
	}

	patient := Patient{PatientID: patientID}
	existed, err := adapter.engine.Get(&patient)
	if err != nil {
		return &patient, err
	}

	if existed {
		return &patient, nil
	} else {
		return nil, nil
	}
}

func UpdatePatient(PatientID string, patient *Patient) (bool, error) {
	p, err := GetPatient(PatientID)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}

	affected, err := adapter.engine.ID(PatientID).AllCols().Update(patient)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func AddPatient(patient *Patient) (bool, error) {
	affected, err := adapter.engine.Insert(patient)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeletePatient(patient *Patient) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{patient.PatientID}).Delete(&Patient{})
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}
