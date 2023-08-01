<script setup>
import {
  FileTextOutlined,
	GithubOutlined
} from '@ant-design/icons-vue';
import { ref, h } from 'vue';

import consumerVariables from '../../demo/consumer-variables/config.json';
import loadBalancer from '../../demo/load-balancer/config.json';
import staticWeb from '../../demo/static-web/config.json';
import fullConfig from '../../docs/flowchart/config/config.json';
const config = ref(JSON.stringify(fullConfig));
const activeKey  = ref('Config');
const exsamples = {
	'Consumer Variables':consumerVariables,
	'Load Balancer':loadBalancer,
	'Static Web':staticWeb,
	'Full Config':fullConfig,
};
const useDemo = (key) => {
	config.value = JSON.stringify(exsamples[key]);
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
				key: 'Full Config',
        label: 'Full Config',
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
					v-model:value="config"
				/>
		</a-col>
		<a-col :span="12">
			<GatewayView :d="config" />
		</a-col>
	</a-row>
</template>