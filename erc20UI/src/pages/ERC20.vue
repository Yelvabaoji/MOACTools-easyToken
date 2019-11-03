<template>
  <q-page padding>
    <q-form @submit="onSubmit" class="q-gutter-md">
      <q-input class='q-mt-xs q-mb-none' filled v-model="privateKey"
        placeholder="输入66位0x开头的私钥"
        stack-label dense hide-bottom-space
        clearable clear-icon="close"
        counter maxlength="66"
        lazy-rules
        :type="isPwd ? 'password' : 'text'"
        :rules="[ val => val.length == 66 || '请输入66位0x开头的私钥.']"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
        <template v-slot:after>
          <q-btn round dense flat icon="search" v-on:click="getWalletInfo()" />
        </template>
      </q-input>

      <div class='q-mt-none q-mb-none'>
        <p>钱包：{{address}}，数量：{{String(balance.toString()).replace(/^(-?)(\d+)((\.\d+)?)$/,
          function (s, s1, s2, s3) {return s1 + s2.replace(/\d{1,3}(?=(\d{3})+$)/g, '$&,') + s3})
        }}</p>
      </div>

      <q-separator color="orange" inset />

      <q-input class='q-mt-xs q-mb-none' filled v-model="name"
        placeholder="代币名称，如Bitcoin，最多20个字符"
        stack-label dense hide-bottom-space
        clearable clear-icon="close"
        counter maxlength="20"
        lazy-rules
        :rules="[ val => val && val.length > 0 || '请输入代币名称']"
      />
      <q-input class='q-mt-xs q-mb-none' filled v-model="symbol"
        placeholder="代币标记符号，如BTC，最多6个字符"
        stack-label dense hide-bottom-space
        clearable clear-icon="close"
        counter maxlength="6"
        lazy-rules
        :rules="[ val => val && val.length > 0 || '请输入代币符号']"
      />
      <q-input class='q-mt-xs q-mb-none' filled type="number" v-model="quantity"
        placeholder="发行数量，最多1,000,000,000,000"
        stack-label dense hide-bottom-space
        clearable clear-icon="close"
        counter maxlength="13"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || '请输入发行数量',
          val => val > 0 && val <= 1000000000000 || '最多1,000,000,000,000'
        ]"
      />
      <q-input class='q-mt-xs q-mb-none' filled type="number" v-model="decimals"
        placeholder="精确度，0-18，默认18"
        stack-label dense hide-bottom-space
        clearable clear-icon="close"
        counter maxlength="2"
        lazy-rules
        :rules="[
          val => val !== null && val !== '' || '请输入精确度',
          val => val >= 0 && val <= 18 || '0-18之间'
        ]"
      />
      <div>
        <q-btn class="full-width q-mt-md" label="提交发行" type="submit" color="primary"/>
      </div>
    </q-form>

    <div v-if="coinCreated" class='q-mt-md q-mb-none'>
      <p>生成代币信息</p>
      <p>合约地址：{{contractHash}}</p>
      <p>名字：{{name}}, 符号：{{symbol}}</p>
      <p>数量：{{quantity}}，精确度：{{decimals}}</p>
    </div>

  </q-page>
</template>

<style>
</style>

<script>
import Chain3 from 'chain3'
export default {
  // name: 'PageIndex',
  data () {
    return {
      privateKey: '',
      isPwd: true,
      address: '',
      balance: 0,
      name: '',
      symbol: '',
      quantity: '',
      decimals: '18',
      contractHash: '',
      coinCreated: false,
      chain3: null,
      myTokenByteCode: '608060405260068054600160a060020a031916905534801561002057600080fd5b50604051610a08380380610a088339810160409081528151602080840151928401516060850151608086015160068054600160a060020a031916600160a060020a038716179055948601805194969095920193909261008491600091870190610105565b508251610098906001906020860190610105565b506002829055600a82900a81026003819055600654600160a060020a0316600090815260046020908152604080832084905580519384525133937fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92908290030190a350505050506101a0565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061014657805160ff1916838001178555610173565b82800160010185558215610173579182015b82811115610173578251825591602001919060010190610158565b5061017f929150610183565b5090565b61019d91905b8082111561017f5760008155600101610189565b90565b610859806101af6000396000f3006080604052600436106100ae5763ffffffff7c010000000000000000000000000000000000000000000000000000000060003504166306fdde0381146100c0578063095ea7b31461014a57806318160ddd1461018257806323b872dd146101a9578063313ce567146101c657806341c0e1b5146101db5780634d853ee5146101f257806370a082311461022357806395d89b4114610244578063a9059cbb14610259578063dd62ed3e14610270575b3480156100ba57600080fd5b50600080fd5b3480156100cc57600080fd5b506100d5610297565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561010f5781810151838201526020016100f7565b50505050905090810190601f16801561013c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b34801561015657600080fd5b5061016e600160a060020a0360043516602435610325565b604080519115158252519081900360200190f35b34801561018e57600080fd5b506101976103c7565b60408051918252519081900360200190f35b61016e600160a060020a03600435811690602435166044356103cd565b3480156101d257600080fd5b506101976105bf565b3480156101e757600080fd5b506101f06105c5565b005b3480156101fe57600080fd5b506102076105e8565b60408051600160a060020a039092168252519081900360200190f35b34801561022f57600080fd5b50610197600160a060020a03600435166105f7565b34801561025057600080fd5b506100d5610612565b61016e600160a060020a036004351660243561066c565b34801561027c57600080fd5b50610197600160a060020a03600435811690602435166107d4565b6000805460408051602060026001851615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561031d5780601f106102f25761010080835404028352916020019161031d565b820191906000526020600020905b81548152906001019060200180831161030057829003601f168201915b505050505081565b60008115806103555750336000908152600560209081526040808320600160a060020a0387168452909152902054155b151561036057600080fd5b336000818152600560209081526040808320600160a060020a03881680855290835292819020869055805186815290519293927f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925929181900390910190a350600192915050565b60035481565b60035460009082111561042a576040805160e560020a62461bcd02815260206004820152601660248201527f4d6f7265207468616e20746f74616c20737570706c7900000000000000000000604482015290519081900360640190fd5b600160a060020a03841660009081526004602052604090205482118015906104755750600160a060020a03841660009081526005602090815260408083203384529091529020548211155b15156104cb576040805160e560020a62461bcd02815260206004820152601060248201527f4e6f7420656e6f7567682076616c756500000000000000000000000000000000604482015290519081900360640190fd5b600160a060020a0383166000908152600460205260409020546104ee90836107ff565b600160a060020a03808516600090815260046020526040808220939093559086168152205461051d9083610818565b600160a060020a03851660009081526004602090815260408083209390935560058152828220338352905220546105549083610818565b600160a060020a03808616600081815260056020908152604080832033845282529182902094909455805186815290519287169391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef929181900390910190a35060019392505050565b60025481565b600654600160a060020a03163314156105e657600654600160a060020a0316ff5b565b600654600160a060020a031681565b600160a060020a031660009081526004602052604090205490565b60018054604080516020600284861615610100026000190190941693909304601f8101849004840282018401909252818152929183018282801561031d5780601f106102f25761010080835404028352916020019161031d565b6003546000908211156106c9576040805160e560020a62461bcd02815260206004820152601660248201527f4d6f7265207468616e20746f74616c20737570706c7900000000000000000000604482015290519081900360640190fd5b33600090815260046020526040902054821115610730576040805160e560020a62461bcd02815260206004820152601060248201527f4e6f7420656e6f7567682076616c756500000000000000000000000000000000604482015290519081900360640190fd5b3360009081526004602052604090205461074a9083610818565b3360009081526004602052604080822092909255600160a060020a0385168152205461077690836107ff565b600160a060020a0384166000818152600460209081526040918290209390935580518581529051919233927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a350600192915050565b600160a060020a03918216600090815260056020908152604080832093909416825291909152205490565b60008282018381101561081157600080fd5b9392505050565b60008282111561082757600080fd5b509003905600a165627a7a72305820fa6aaebc8790596fea388865b63acb1eb7e6ccaa11b60d44c7bdf1cf4fe046150029'
    }
  },

  created () {

  },
  mounted () {
    this.chain3 = new Chain3()
    this.chain3.setProvider(new Chain3.providers.HttpProvider(
      'http://localhost:8545'
    ))
    if (!this.chain3.isConnected()) {
      console.log('Chain3 RPC is not connected!')
    } else {
      console.log('Chain3 connected')
    }
  },
  methods: {
    getWalletInfo () {
      if (this.privateKey.length !== 66) {
        this.$q.dialog({ title: '警告', message: '私钥长度不对' })
        return
      }
      this.axios.post('getWalletInfo',
        {
          key: this.privateKey
        }
      ).then((response) => {
        var data = response.data
        if (data.result !== 'OK') {
          this.$q.dialog({ title: '警告', message: data.result })
          return
        }
        this.address = data.address
        this.balance = data.balance
      }).catch((response) => {
        this.$q.dialog({ title: '警告', message: '传输出错了' })
      })
    },
    // ****************************************************
    // ****************************************************
    onSubmit () {
      if (this.privateKey.length !== 66) {
        this.$q.dialog({ title: '警告', message: '私钥长度不对' })
        return
      }
      this.$q.dialog({ title: '确定',
        message: '确定要发币吗？',
        cancel: '取消',
        ok: '确定',
        persistent: false
      }).onOk(() => {
        this.$q.loading.show({
          message: '代币正在创建中，请等待。。。'
        })
        var chain3 = this.chain3
        var types = ['address', 'string', 'string', 'uint', 'uint256']
        var args = [this.address, this.name, this.symbol, this.decimals, this.quantity]
        var parameter = chain3.encodeParams(types, args)
        console.log(parameter)

        var rawTx = {
          from: this.address,
          nonce: chain3.intToHex(chain3.mc.getTransactionCount(this.address)),
          gasPrice: chain3.intToHex(50000000000),
          gasLimit: chain3.intToHex(4000000),
          data: '0x' + this.myTokenByteCode + parameter,
          chainId: chain3.version.network
        }
        var signedTx = chain3.signTransaction(rawTx, this.privateKey)
        console.log('signedTx=', typeof (signedTx), signedTx)

        this.axios.post('createErc20Token',
          {
            key: this.privateKey,
            name: this.name,
            symbol: this.symbol,
            quantity: this.quantity,
            decimals: this.decimals,
            signedTx: signedTx
          }
        ).then((response) => {
          var data = response.data
          if (data.result === 'OK') {
            this.$q.loading.hide()
            this.contractHash = data.hash
            this.coinCreated = true
            this.$q.dialog({ title: '通知', message: '代币创建成功，合约地址：\n' + data.hash })
          } else {
            this.$q.dialog({ title: '警告', message: data.result })
          }
        }).catch((response) => {
          this.$q.loading.hide()
          console.log('传输出错了!!!')
          this.$q.dialog({ title: '警告', message: '传输出错了' })
        })
        console.log('>>>> OK')
      })
    },
    onSubmitold () {
      if (this.privateKey.length !== 66) {
        this.$q.dialog({ title: '警告', message: '私钥长度不对' })
        return
      }
      this.$q.dialog({ title: '确定',
        message: '确定要发币吗？',
        cancel: '取消',
        ok: '确定',
        persistent: false
      }).onOk(() => {
        this.$q.loading.show({
          message: '代币正在创建中，请等待。。。'
        })
        this.axios.post('createErc20Token',
          {
            key: this.privateKey,
            name: this.name,
            symbol: this.symbol,
            quantity: this.quantity,
            decimals: this.decimals
          }
        ).then((response) => {
          var data = response.data
          if (data.result === 'OK') {
            this.$q.loading.hide()
            this.contractHash = data.hash
            this.coinCreated = true
            this.$q.dialog({ title: '通知', message: '代币创建成功，合约地址：\n' + data.hash })
          } else {
            this.$q.dialog({ title: '警告', message: data.result })
          }
        }).catch((response) => {
          this.$q.loading.hide()
          console.log('传输出错了!!!')
          this.$q.dialog({ title: '警告', message: '传输出错了' })
        })
        console.log('>>>> OK')
      })
    }
  }
}
</script>
