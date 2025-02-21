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

type Doctor struct {
	DoctorID    string `xorm:"varchar(100) pk" json:"doctorID"`
	Department  string `xorm:"varchar(100)" json:"department"`
	Name        string `xorm:"varchar(100)" json:"name"`
	Gender      string `xorm:"varchar(100)" json:"gender"`
	AccessLevel string `xorm:"varchar(100)" json:"accessLevel"`
	CanModify   bool   `xorm:"bool" json:"canModify"`
	CanDelete   bool   `xorm:"bool" json:"canDelete"`

	Hospital Hospital `xorm:"varchar(100) index" json:"hospital"`

	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`
}

func GetDoctorCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Doctor{})
}

func GetDoctors() ([]*Doctor, error) {
	doctors := []*Doctor{}
	err := adapter.engine.Desc("created_time").Find(&doctors, &Doctor{})
	if err != nil {
		return doctors, err
	}
	return doctors, nil
}

func GetPaginationDoctor(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Doctor, error) {
	doctors := []*Doctor{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&doctors)
	if err != nil {
		return doctors, err
	}

	return doctors, nil
}

func GetDoctor(DoctorID string) (*Doctor, error) {
	if DoctorID == "" {
		return nil, nil
	}
	docter := Doctor{DoctorID: DoctorID}
	existed, err := adapter.engine.Get(&docter)
	if err != nil {
		return &docter, err
	}
	if existed {
		return &docter, nil
	} else {
		return nil, nil
	}
}

func UpdateDoctor(DoctorID string, docter *Doctor) (bool, error) {
	p, err := GetDoctor(DoctorID)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}
	affected, err := adapter.engine.ID(DoctorID).AllCols().Update(docter)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddDoctor(docter *Doctor) (bool, error) {
	affected, err := adapter.engine.Insert(docter)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeleteDoctor(docter *Doctor) (bool, error) {
	affected, err := adapter.engine.Delete(docter)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}
