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

	"github.com/casvisor/casvisor/chain"
	"github.com/casvisor/casvisor/util"
)

func (sharing *Sharing) getSharingProvider() (*Provider, error) {
	if sharing.ChainProvider != "" {
		provider, err := getProvider(sharing.Owner, sharing.ChainProvider)
		if err != nil {
			return nil, err
		}

		if provider != nil {
			return provider, nil
		}
	}

	provider, err := getActiveBlockchainProvider(sharing.Owner)
	if err != nil {
		return nil, err
	}

	return provider, nil
}

func (sharing *Sharing) getSharingChainClient() (chain.ChainClientInterface, error) {
	provider, err := sharing.getSharingProvider()
	if err != nil {
		return nil, err
	}
	if provider == nil {
		return nil, fmt.Errorf("there is no active UsageBlockchain provider")
	}

	client, err2 := chain.NewChainClient(provider.Type, provider.ClientId, provider.ClientSecret, provider.Region, provider.Network, provider.Chain)
	if err2 != nil {
		return nil, err2
	}

	return client, nil
}

func (sharing *Sharing) toMap() map[string]string {
	result := map[string]string{}

	result["owner"] = sharing.Owner
	result["name"] = sharing.Name
	result["createdTime"] = sharing.CreatedTime
	result["updatedTime"] = sharing.UpdatedTime
	result["displayName"] = sharing.DisplayName

	result["dataOwner"] = sharing.DataOwner
	result["ownerOrganization"] = sharing.OwnerOrganization
	result["authorizedUser"] = sharing.AuthorizedUser
	result["userOrganization"] = sharing.UserOrganization

	result["datasetId"] = sharing.DatasetId
	result["dataDiscription"] = sharing.DataDiscription
	result["dataDigest"] = sharing.DataDigest
	result["dataSignature"] = sharing.DataSignature

	result["taskId"] = sharing.TaskId
	result["taskDescription"] = sharing.TaskDescription
	result["taskDigest"] = sharing.TaskDigest
	result["taskSignature"] = sharing.TaskSignature

	result["teeProvider"] = sharing.TeeProvider
	result["attestId"] = sharing.AttestId
	result["signerId"] = sharing.SignerId

	result["totalCount"] = sharing.TotalCount
	result["leftCount"] = sharing.LeftCount
	result["expireTime"] = sharing.ExpireTime
	result["usageBlock"] = sharing.UsageBlock

	result["avaliable"] = fmt.Sprintf("%t", sharing.Avaliable)

	result["chainProvider"] = sharing.ChainProvider

	return result
}

func (sharing *Sharing) toParam() string {
	sharing2 := *sharing
	sharing2.UsageBlock = ""
	sharing2.Transaction = ""

	res := Param{
		Key:   sharing2.getId(),
		Field: "Sharing",
		Value: util.StructToJson(sharing2),
	}
	return util.StructToJson(res)
}

func CommitSharing(sharing *Sharing) (bool, error) {
	if sharing.UsageBlock != "" {
		return false, fmt.Errorf("the sharing: %s has already been committed, UsageBlockId = %s", sharing.getId(), sharing.UsageBlock)
	}

	client, err := sharing.getSharingChainClient()
	if err != nil {
		return false, err
	}

	UsageBlockId, transactionId, err := client.Commit(sharing.toParam())
	if err != nil {
		return false, err
	}

	sharing.UsageBlock = UsageBlockId
	sharing.Transaction = transactionId
	return UpdateSharing(sharing.getId(), sharing)
}

func QuerySharing(id string) (string, error) {
	sharing, err := GetSharing(id)
	if err != nil {
		return "", err
	}
	if sharing == nil {
		return "", fmt.Errorf("the sharing: %s does not exist", id)
	}

	if sharing.UsageBlock == "" {
		return "", fmt.Errorf("the sharing: %s's UsageBlock ID should not be empty", sharing.getId())
	}

	client, err := sharing.getSharingChainClient()
	if err != nil {
		return "", err
	}

	res, err := client.Query(sharing.Transaction, sharing.toParam())
	if err != nil {
		return "", err
	}

	return res, nil
}

