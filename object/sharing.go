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

type Sharing struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`
	DisplayName string `xorm:"varchar(100)" json:"displayName"`

	DataOwner      string `xorm:"varchar(100)" json:"dataOwner"`
	OwnerOrganization string `xorm:"varchar(100)" json:"ownerOrganization"`
	AuthorizedUser string `xorm:"varchar(100)" json:"authorizedUser"`
	UserOrganization string `xorm:"varchar(100)" json:"userOrganization"`

	DatasetId string `xorm:"varchar(100)" json:"datasetId"`
	DataDiscription string `xorm:"varchar(100)" json:"dataDiscription"`
	DataDigest    string `xorm:"varchar(100)" json:"dataDigest"`
	DataSignature string `xorm:"varchar(100)" json:"dataSignature"`

	TaskId      string `xorm:"varchar(100)" json:"taskId"`
	TaskDescription    string `xorm:"varchar(100)" json:"taskDescription"`
	TaskDigest   string `xorm:"varchar(100)" json:"taskDigest"`
	TaskSignature string `xorm:"varchar(100)" json:"taskSignature"`

	TeeProvider string `xorm:"varchar(100)" json:"teeProvider"`
	AttestId    string `xorm:"varchar(100)" json:"attestId"`
	SignerId    string `xorm:"varchar(100)" json:"signerId"`

	TotalCount string `xorm:"varchar(100)" json:"totalCount"`
	LeftCount  string `xorm:"varchar(100)" json:"leftCount"`
	ExpireTime string `xorm:"varchar(100)" json:"expireTime"`
	UsageBlock string `xorm:"varchar(100)" json:"usageBlock"`

	Avaliable string `xorm:"varchar(100)" json:"avaliable"`

	ChainProvider    string `xorm:"varchar(100)" json:"chainProvider"`
	Transaction string `xorm:"varchar(500)" json:"transaction"`
}

func GetSharingCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Sharing{})
}

func GetSharings(owner string) ([]*Sharing, error) {
	sharings := []*Sharing{}
	err := adapter.engine.Desc("created_time").Find(&sharings, &Sharing{Owner: owner})
	if err != nil {
		return sharings, err
	}

	return sharings, nil
}

func GetPaginationSharings(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Sharing, error) {
	sharings := []*Sharing{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&sharings)
	if err != nil {
		return sharings, err
	}

	return sharings, nil
}

func getSharing(owner string, name string) (*Sharing, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	sharing := Sharing{Owner: owner, Name: name}
	existed, err := adapter.engine.Get(&sharing)
	if err != nil {
		return &sharing, err
	}

	if existed {
		return &sharing, nil
	} else {
		return nil, nil
	}
}

func GetSharing(id string) (*Sharing, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	return getSharing(owner, name)
}

func GetMaskedSharing(sharing *Sharing, errs ...error) (*Sharing, error) {
	if len(errs) > 0 && errs[0] != nil {
		return nil, errs[0]
	}

	if sharing == nil {
		return nil, nil
	}

	// if sharing.ClientSecret != "" {
	// 	sharing.ClientSecret = "***"
	// }
	return sharing, nil
}

func GetMaskedSharings(sharings []*Sharing, errs ...error) ([]*Sharing, error) {
	if len(errs) > 0 && errs[0] != nil {
		return nil, errs[0]
	}

	var err error
	for _, sharing := range sharings {
		sharing, err = GetMaskedSharing(sharing)
		if err != nil {
			return nil, err
		}
	}

	return sharings, nil
}

func UpdateSharing(id string, sharing *Sharing) (bool, error) {
	owner, name := util.GetOwnerAndNameFromId(id)
	p, err := getSharing(owner, name)
	if err != nil {
		return false, err
	} else if p == nil {
		return false, nil
	}

	// if sharing.ClientSecret == "***" {
	// 	sharing.ClientSecret = p.ClientSecret
	// }

	affected, err := adapter.engine.ID(core.PK{owner, name}).AllCols().Update(sharing)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func AddSharing(sharing *Sharing) (bool, error) {
	affected, err := adapter.engine.Insert(sharing)
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func DeleteSharing(sharing *Sharing) (bool, error) {
	affected, err := adapter.engine.ID(core.PK{sharing.Owner, sharing.Name}).Delete(&Sharing{})
	if err != nil {
		return false, err
	}

	return affected != 0, nil
}

func (sharing *Sharing) getId() string {
	return fmt.Sprintf("%s/%s", sharing.Owner, sharing.Name)
}
