<script setup>
import {
  FileTextOutlined,
	GithubOutlined
} from '@ant-design/icons-vue';
import { ref, h, watch } from 'vue';

import consumerVariables from '../../demo/consumer-variables/config.json';
import loadBalancer from '../../demo/load-balancer/config.json';
import staticWeb from '../../demo/static-web/config.json';
import reverseProxy from '../../demo/reverse-proxy/config.json';
const config = ref(staticWeb);
const configString = ref(JSON.stringify(staticWeb));
const exsamples = {
	'Consumer Variables':consumerVariables,
	'Load Balancer':loadBalancer,
	'Static Web':staticWeb,
	'Reverse Proxy':reverseProxy,
};
watch(config, (n, o)=>{
  if(JSON.stringify(n)!=configString.value){
    configString.value = JSON.stringify(n);
  }
},{
  deep: true,
  immediate: true
});
watch(configString, (n, o)=>{
  if(JSON.stringify(config.value)!=n){
    config.value = JSON.parse(n);
  }
});
const useDemo = (key) => {
	config.value = exsamples[key];
}
const menus = [
  {
    key: 'exsamples',
    icon: () => h(FileTextOutlined),
    label: 'Exsamples',
    title: 'Exsamples',
    children: [
      {
				key: 'Consumer Variables',
        label: 'Consumer Variables',
      },
      {
				key: 'Load Balancer',
        label: 'Load Balancer',
      },
      {
				key: 'Static Web',
        label: 'Static Web',
      },
      {
        key: 'Reverse Proxy',
        label: 'Reverse Proxy',
      },
    ],
  },
  {
    key: 'docs',
    icon: () => h(GithubOutlined),
    label: 'Document',
    title: 'Document',
  },
]
const menuClick = (e) => {
	if(e.key == 'docs'){
		window.open("https://github.com/flomesh-io/fgw/blob/main/docs/README.md")
	} else {
		useDemo(e.key);
	}
}
</script>
<template>
	<a-menu @click="menuClick" theme="dark" mode="horizontal" :items="menus" />
	<a-row>
		<a-col :span="12">
				<JsonEditor 
					:is-json="true"
					height="700px"
					v-model:value="configString"
				/>
		</a-col>
		<a-col :span="12">
			<GatewayView v-model:d="config" />
		</a-col>
	</a-row>
</template>