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

type FederalLearning struct {
	TaskID      string `xorm:"varchar(100) pk" json:"taskID"`
	TaskName    string `xorm:"varchar(100)" json:"taskName"`
	Discription string `xorm:"varchar(100)" json:"discription"`
	Epoch       int    `xorm:"int" json:"epoch"`
	ModelPath   string `xorm:"varchar(100)" json:"ModelPath"`

	Hospital []*Hospital `xorm:"varchar(100) index" json:"hospital"`

	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`
}

func GetFederalLearningCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&FederalLearning{})
}

func GetFederalLearnings() ([]*FederalLearning, error) {
	tasks := []*FederalLearning{}
	err := adapter.engine.Desc("created_time").Find(&tasks, &FederalLearning{})
	if err != nil {
		return tasks, err
	}

	return tasks, nil
}

func GetPaginationFederalLearning(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*FederalLearning, error) {
	tasks := []*FederalLearning{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&tasks, &FederalLearning{})
	if err != nil {
		return tasks, err
	}

	return tasks, nil
}

func GetFederalLearning(taskID string) (*FederalLearning, error) {
	if taskID == "" {
		return nil, nil
	}
	federalLearning := FederalLearning{TaskID: taskID}
	existed, err := adapter.engine.Get(&federalLearning)
	if err != nil {
		return &federalLearning, err
	}
	if existed {
		return &federalLearning, nil
	} else {
		return nil, nil
	}
}

func UpdateFederalLearning(taskID string, federalLearning *FederalLearning) (bool, error) {
	p, err := GetFederalLearning(taskID)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}
	affected, err := adapter.engine.ID(taskID).AllCols().Update(federalLearning)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddFederalLearning(federalLearning *FederalLearning) (bool, error) {
	affected, err := adapter.engine.Insert(federalLearning)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeleteFederalLearning(federalLearning *FederalLearning) (bool, error) {
	affected, err := adapter.engine.Delete(&federalLearning)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}
