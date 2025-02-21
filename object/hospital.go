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

type Hospital struct {
	HospitalID string `xorm:"varchar(100) pk" json:"hospitalID"`
	Name       string `xorm:"varchar(100)" json:"name"`
	Address    string `xorm:"varchar(100)" json:"address"`

	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`
}

func GetHospitalCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Hospital{})
}

func GetHospitals() ([]*Hospital, error) {
	hospitals := []*Hospital{}
	err := adapter.engine.Desc("created_time").Find(&hospitals, &Hospital{})
	if err != nil {
		return hospitals, err
	}
	return hospitals, nil
}

func GetPaginationHospital(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Hospital, error) {
	hospitals := []*Hospital{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&hospitals)
	if err != nil {
		return hospitals, err
	}

	return hospitals, nil
}

func GetHospital(hospitalID string) (*Hospital, error) {
	if hospitalID == "" {
		return nil, nil
	}
	hospital := Hospital{HospitalID: hospitalID}
	existed, err := adapter.engine.Get(&hospital)
	if err != nil {
		return &hospital, err
	}
	if existed {
		return &hospital, nil
	} else {
		return nil, nil
	}
}

func UpdateHospital(hospitalID string, hospital *Hospital) (bool, error) {
	p, err := GetHospital(hospitalID)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}
	affected, err := adapter.engine.ID(hospitalID).AllCols().Update(hospital)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddHospital(hospital *Hospital) (bool, error) {
	affected, err := adapter.engine.Insert(hospital)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeleteHospital(hospital *Hospital) (bool, error) {
	affected, err := adapter.engine.Delete(&hospital)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}
