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

type Consultation struct {
	ConsultationID string `xorm:"varchar(100) pk" json:"consultationID"`

	Patient Patient `xorm:"varchar(100) index" json:"patient"`
	Doctor  Doctor  `xorm:"varchar(100) index" json:"doctor"`

	Data          string `xorm:"varchar(100)" json:"data"`
	Direction     string `xorm:"varchar(100)" json:"direction"`
	DirectionDate string `xorm:"varchar(100)" json:"directionDate"`

	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`
}

func GetConsultationCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Consultation{})
}

func GetConsultations() ([]*Consultation, error) {
	consultations := []*Consultation{}
	err := adapter.engine.Desc("created_time").Find(&consultations, &Consultation{})
	if err != nil {
		return consultations, err
	}

	return consultations, nil
}

func GetPaginationConsultation(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Consultation, error) {
	consultations := []*Consultation{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&consultations)
	if err != nil {
		return consultations, err
	}

	return consultations, nil
}

func GetConsultation(consultationID string) (*Consultation, error) {
	if consultationID == "" {
		return nil, nil
	}
	consultation := Consultation{ConsultationID: consultationID}
	existed, err := adapter.engine.Get(&consultation)
	if err != nil {
		return &consultation, err
	}
	if existed {
		return &consultation, nil
	} else {
		return nil, nil
	}
}

func UpdateConsultation(consultationID string, consultation *Consultation) (bool, error) {
	p, err := GetConsultation(consultationID)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}
	affected, err := adapter.engine.ID(consultationID).AllCols().Update(consultation)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddConsultation(consultation *Consultation) (bool, error) {
	affected, err := adapter.engine.Insert(consultation)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeleteConsultation(consultation *Consultation) (bool, error) {
	affected, err := adapter.engine.Delete(&consultation)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}
