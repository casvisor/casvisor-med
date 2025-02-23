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

type Learning struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`

	Discription    string `xorm:"varchar(100)" json:"discription"`
	Epoch          string `xorm:"varchar(100)" json:"epoch"`
	ModelPath      string `xorm:"varchar(100)" json:"modelPath"`
	HospitalName       string `xorm:"varchar(100)" json:"hospitalName"`
	LocalBatchSize string `xorm:"varchar(100)" json:"localBatchSize"`
	LocalEpochs    string `xorm:"varchar(100)" json:"localEpochs"`
}

func GetLearningCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Learning{})
}

func GetLearnings(owner string) ([]*Learning, error) {
	learnings := []*Learning{}
	err := adapter.engine.Desc("created_time").Find(&learnings, &Learning{Owner: owner})
	if err != nil {
		return learnings, err
	}

	return learnings, nil
}

func GetPaginationLearnings(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Learning, error) {
	learnings := []*Learning{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&learnings)
	if err != nil {
		return learnings, err
	}

	return learnings, nil
}

func getLearning(owner string, name string) (*Learning, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	learning := Learning{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&learning)
	if err != nil {
		return &learning, err
	}

	if existed {
		return &learning, nil
	} else {
		return nil, nil
	}
}

func GetLearning(id string) (*Learning, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getLearning(owner, name)
}

func GetMaskedLearning(learning *Learning, errs ...error) (*Learning, error) {
	if len(errs) > 0 && errs[0] != nil {
		return nil, errs[0]
	}

	if learning == nil {
		return nil, nil
	}

	// if learning.ClientSecret != "" {
	// 	learning.ClientSecret = "***"
	// }
	return learning, nil
}

func GetMaskedLearnings(learnings []*Learning, errs ...error) ([]*Learning, error) {
	if len(errs) > 0 && errs[0] != nil {
		return nil, errs[0]
	}

	var err error
	for _, learning := range learnings {
		learning, err = GetMaskedLearning(learning)
		if err != nil {
			return nil, err
		}
	}

	return learnings, nil
}

func UpdateLearning(id string, learning *Learning) (bool, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	p, err := getLearning(owner, name)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}

	// if learning.ClientSecret == "***" {
	// 	learning.ClientSecret = p.ClientSecret
	// }

	affected, err := adapter.engine.ID(core.PK{owner, name}).AllCols().Update(learning)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func AddLearning(learning *Learning) (bool, error) {
	affected, err := adapter.engine.Insert(learning)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func DeleteLearning(learning *Learning) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{learning.Owner, learning.Name}).Delete(&Learning{})
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func (learning *Learning) getId() string {
	return fmt.Sprintf("%s/%s", learning.Owner, learning.Name)
}
