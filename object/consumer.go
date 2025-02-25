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

type Consumer struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`

	TeeProvider string `xorm:"varchar(100)" json:"teeProvider"`
	DatasetId   string `xorm:"varchar(100)" json:"datasetId"`
	AttestId    string `xorm:"varchar(100)" json:"AttestId"`
	TaskId      string `xorm:"varchar(100)" json:"taskId"`
	SignerId    string `xorm:"varchar(100)" json:"signerId"`

	Object   string `xorm:"mediumtext" json:"object"`
	Response string `xorm:"mediumtext" json:"response"`
	Result   string `xorm:"mediumtext" json:"result"`

	User               string `xorm:"varchar(100)" json:"user"`
	ChainProvider string `xorm:"varchar(100)" json:"chainProvider"`
	Block              string `xorm:"varchar(100)" json:"block"`
	Transaction        string `xorm:"varchar(500)" json:"transaction"`

	IsRun bool `json:"isRun"`
}

func GetConsumerCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Consumer{})
}

func GetConsumers(owner string) ([]*Consumer, error) {
	consumers := []*Consumer{}
	err := adapter.engine.Desc("created_time").Find(&consumers, &Consumer{Owner: owner})
	if err != nil {
		return consumers, err
	}

	return consumers, nil
}

func GetPaginationConsumers(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Consumer, error) {
	consumers := []*Consumer{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&consumers)
	if err != nil {
		return consumers, err
	}

	return consumers, nil
}

func getConsumer(owner string, name string) (*Consumer, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	consumer := Consumer{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&consumer)
	if err != nil {
		return &consumer, err
	}

	if existed {
		return &consumer, nil
	} else {
		return nil, nil
	}
}

func GetConsumer(id string) (*Consumer, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getConsumer(owner, name)
}

func GetMaskedConsumer(consumer *Consumer, errs ...error) (*Consumer, error) {
	if len(errs) > 0 && errs[0] != nil {
		return nil, errs[0]
	}

	if consumer == nil {
		return nil, nil
	}

	// if consumer.ClientSecret != "" {
	// 	consumer.ClientSecret = "***"
	// }
	return consumer, nil
}

func GetMaskedConsumers(consumers []*Consumer, errs ...error) ([]*Consumer, error) {
	if len(errs) > 0 && errs[0] != nil {
		return nil, errs[0]
	}

	var err error
	for _, consumer := range consumers {
		consumer, err = GetMaskedConsumer(consumer)
		if err != nil {
			return nil, err
		}
	}

	return consumers, nil
}

func UpdateConsumer(id string, consumer *Consumer) (bool, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	p, err := getConsumer(owner, name)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}

	// if consumer.ClientSecret == "***" {
	// 	consumer.ClientSecret = p.ClientSecret
	// }

	affected, err := adapter.engine.ID(core.PK{owner, name}).AllCols().Update(consumer)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func AddConsumer(consumer *Consumer) (bool, error) {
	affected, err := adapter.engine.Insert(consumer)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func DeleteConsumer(consumer *Consumer) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{consumer.Owner, consumer.Name}).Delete(&Consumer{})
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func (consumer *Consumer) getId() string {
	return fmt.Sprintf("%s/%s", consumer.Owner, consumer.Name)
}
