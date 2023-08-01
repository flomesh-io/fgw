<script setup>
import {
  CheckCircleFilled,
	ExclamationCircleOutlined,
	SafetyCertificateFilled,
	SettingFilled,
	ArrowRightOutlined,
	DownOutlined,
	UpOutlined,
	MedicineBoxFilled,
  DeleteOutlined
} from '@ant-design/icons-vue';
import { computed, ref, watch } from 'vue'

import ServiceSvg from "../assets/service.png";

const prop = defineProps(['d'])
const json = ref(prop.d);
const emits = defineEmits(['update:d']);

watch(() => prop.d, (n, o)=>{
  if(JSON.stringify(prop.d)!=JSON.stringify(json.value)){
    json.value = n;
  }
},{
  deep: true,
  immediate: true
});
watch(json, (n, o)=>{
  if(JSON.stringify(json.value)!=JSON.stringify(prop.d)){
    emits('update:d',json.value)
  }
},{
  deep: true,
  immediate: true
});
const remove = (type,target,idx) => {
  switch (type){
    case 'Listener':
      const _index = json.value.Listeners.findIndex((item) => item.Port == target);
      json.value.Listeners.splice(_index, 1);
      
      Object.keys(json.value.RouteRules).forEach((portKey)=>{
      	let portAry = portKey.split(",");
        const _portIndex = portAry.indexOf(target)
      	if(_portIndex > -1 ){
          if(portAry.length == 1){
            delete json.value.RouteRules[portKey]
          } else {
            const _temlate = JSON.parse(JSON.stringify(json.value.RouteRules[portKey]));
            delete json.value.RouteRules[portKey]
            portAry.splice(_index, 1);
            json.value.RouteRules[portAry.join(",")] = _temlate;
          }
      	}
      });
      break;
    case 'RouteRule':
      Object.keys(json.value.RouteRules).forEach((portKey) => {
        let portAry = portKey.split(",");
        const _portIndex = portAry.indexOf(target+'')
        if(_portIndex > -1 ){
          delete json.value.RouteRules[portKey][idx];
        }
      });
      break;
    case 'Service':
      delete json.value.Services[target];
      break;
    default:
      break;
  }
}
const findRouteRule = computed(() => (port) => {
	let _rtn = null
	Object.keys(json.value.RouteRules).forEach((portKey)=>{
		const portAry = portKey.split(",");
		if(portAry.indexOf(`${port}`) > -1 ){
			_rtn = json.value.RouteRules[portKey]
		}
	});
	return _rtn && Object.keys(_rtn).length>0?_rtn : null;
});
const treeData = computed(() => (title, files) => {
	let rtn = [{title, key:title, children:[] }];
	files.forEach((file) => {
		rtn[0].children.push({title: file, key: file})
	});
	return rtn;
});
const colorMap = {'HTTPS':'bg-green'};
const displayMap = ref({});
</script>

<template>
	<div class="pd-15">
		<a-result v-if="!json" status="warning" title="Typing..."/>
		<div v-else>
			<section v-if="json.Configs">
				<h4><SettingFilled class="gray" /> Config</h4>
				<div class="config-block flex mb-20" >
					<b class="flex-item">Enable Debug</b>
					<div class="width-60">
            <a-switch v-model:checked="json.Configs.EnableDebug" size="small" />
					</div>
					<b class="flex-item">Strip Any Host Port</b>
					<div class="width-60">
            <a-switch v-model:checked="json.Configs.StripAnyHostPort" size="small" />
					</div>
					<b class="flex-item">Default Passthrough Upstream Port</b>
					<div >
            <a-input-number :min="0" v-model:value="json.Configs.DefaultPassthroughUpstreamPort" placeholder="Basic usage" />
					</div>
				</div>
			</section>
			
			<section v-if="json.Listeners">
				<h4><SettingFilled class="gray" /> Listeners / RouteRules</h4>
				<a-timeline v-if="json.Listeners.length>0">
					<a-timeline-item v-for="(listener,index) in json.Listeners">
						<div class="listener-block" >
							<a-space>
								<a-button :class="colorMap[listener.Protocol]" type="primary" >{{listener.Protocol}}</a-button>
								<!-- <a-tag color="#2db7f5">{{listener.Protocol}}</a-tag> -->
								<b class="nowrap">Port:</b>
								<a-tag color="blue">{{listener.Port}}</a-tag>
								<span class="nowrap" v-if="listener.Listen"><ArrowRightOutlined/></span>
								<b class="nowrap" v-if="listener.Listen">Listen:</b>
								<a-tag v-if="listener.Listen" color="blue">{{listener.Listen}}</a-tag>
              </a-space>
							<a-space>
								<b class="nowrap" style="margin-left: 85px;">Route</b>
								<template v-if="findRouteRule(listener.Port)">
									<span v-if="!displayMap[`listener-${listener.Port}`]" class="nowrap" >
										<a-badge :count="Object.keys(findRouteRule(listener.Port)).length || 0" />
									</span>
									<div v-else class="route-block " style="padding-right: 50px;">
										<a-space>
											<ol>
												<li class="relative mb-10" v-for="(host) in Object.keys(findRouteRule(listener.Port))">
													<a-space v-if="typeof(findRouteRule(listener.Port)[host]) == 'object'">
														<a-button v-if="!!findRouteRule(listener.Port)[host].RouteType" size="small" :class="colorMap[findRouteRule(listener.Port)[host].RouteType]" type="primary" >
															{{findRouteRule(listener.Port)[host].RouteType}}
														</a-button>
														<b class="nowrap">{{host}}</b> 
														<span class="nowrap"><ArrowRightOutlined/></span> 
														<ul v-if="!!findRouteRule(listener.Port)[host].Matches">
															<li v-for="(matche, matcheIndex) in findRouteRule(listener.Port)[host].Matches">
																	<a-tag v-if="matche.Path"> {{matche.Path?.Type}} | {{matche.Path?.Path}}</a-tag>
																	<a-tag v-if="matche.BackendService" v-for="(backend) in Object.keys(matche.BackendService)"> {{backend}}:{{matche.BackendService[backend]}}</a-tag>
																	<a-tag v-if="matche.ServerRoot">Server Root: {{matche.ServerRoot}}</a-tag>
																	<a-popover title="Header">
																		<template #content>
																			<p v-for="(header) in Object.keys(matche.Headers)"><b>{{header}}</b>: <a-tag>{{matche.Headers[header]}}</a-tag></p>
																		</template>
																		<ExclamationCircleOutlined class="font-primary"/>
																	</a-popover>
															</li>
														</ul>
														<a-tag v-else v-for="(backend) in Object.keys(findRouteRule(listener.Port)[host])"> {{backend}}:{{findRouteRule(listener.Port)[host][backend]}}</a-tag>
                          </a-space>
													<a-space v-else>
														<b>{{host}}</b> 
														<span class="nowrap"><ArrowRightOutlined/></span> 
														<span class="ml-5">{{findRouteRule(listener.Port)[host]}}</span>
													</a-space>
                          <DeleteOutlined @click="remove('RouteRule',listener.Port, host)" class="absolute icon-menu-sm vm" style="right: -40px;top: 50%;margin-top: -14px;"/>
												</li>
											</ol>
										</a-space>
									</div>
								</template>
								<div v-else>
									<a-tag>None</a-tag>
                  
								</div>
							</a-space>
              <div class="font-right" v-if="displayMap[`listener-${listener.Port}`]">
                <DeleteOutlined @click="remove('Listener',listener.Port)" class="icon-menu vm " />
                <UpOutlined @click="displayMap[`listener-${listener.Port}`] = false" class="icon-menu vm " />
              </div>
              <div v-else class="absolute" style="right: 15px;margin-top: -31px;">
                <DeleteOutlined  class="icon-menu-sm vm " @click="remove('Listener',listener.Port)"  />
                <DownOutlined class="icon-menu-sm vm ml-10" @click="displayMap[`listener-${listener.Port}`] = true"/>
              </div>
						</div>
					</a-timeline-item>
				</a-timeline>
			</section>
			
			<section v-if="json.Services">
				<h4><SettingFilled class="gray" /> Services</h4>
				<a-timeline v-if="Object.keys(json.Services).length>0">
					<a-timeline-item v-for="(service,index) in Object.keys(json.Services)">
						<a-card class="service-block mb-20" v-if="!displayMap[`service-${service}`]" hoverable >
							<template #actions>
								<span>
									Endpoint
									<a-badge :count="Object.keys(json.Services[service].Endpoints||{}).length" />
								</span>
								<span v-if="json.Services[service].Filters">
									Filters
									<a-badge :count="json.Services[service].Filters.length || 0" />
								</span>
								<span v-if="Object.keys(json.Services[service].HealthCheck||{}).length>0">
									HealthCheck
									<MedicineBoxFilled class="font-green" />
								</span>
								<span>
									More
									<DownOutlined @click="displayMap[`service-${service}`] = true"/>
								</span>
							</template>
							<a-card-meta :title="service" :description="`Cookie: ${json.Services[service].StickyCookieName || 'None'}`">
								<template #avatar>
									<a-avatar
										size="small"
										shape="square"
										:src="ServiceSvg"
									/>
								</template>
							</a-card-meta>
						</a-card>
						
						<div v-else class="service-block mb-20 all">
							<div class="flex">
								<b class="flex-item nowrap">Service</b>
								<div class="flex-item" style="flex: 2;">
									<block class="block-item">
										<a-avatar
											size="small"
											shape="square"
											:src="ServiceSvg"
										/>
										{{service}}
									</block>
								</div>
								<b class="flex-item">Sticky Cookie</b>
								<div class="flex-item">
									{{json.Services[service].StickyCookieName || '-'}}
								</div>
								<b class="flex-item">Cookie Expires (s)</b>
								<div class="flex-item">
									{{json.Services[service].StickyCookieExpires || '-'}}
								</div>
							</div>
							<div class="flex">
								<b class="flex-item nowrap">Endpoints</b>
								<div class="flex-item" style="flex: 5;">
									<div class="endpoint-block" >
										<ol>
											<li v-for="(endpoint) in Object.keys(json.Services[service].Endpoints)">
												<a-space>
													<b class="nowrap">{{endpoint}}</b>
													<span><ArrowRightOutlined/></span> 
													<div class="inline-block">
														<div>
															<a-tag>Weight:{{json.Services[service].Endpoints[endpoint].Weight}}</a-tag>
															<a-tag v-for="(tag) in Object.keys(json.Services[service].Endpoints[endpoint].Tags)">{{tag}}:{{json.Services[service].Endpoints[endpoint].Tags[tag]}}</a-tag>
														</div>
														<div class="flex" v-if="json.Services[service].Endpoints[endpoint].UpstreamCert">
															<div class="flex-item nowrap" v-if="!!json.Services[service].Endpoints[endpoint].UpstreamCert.CertChain">Cert Chain
																<a-tooltip :title="json.Services[service].Endpoints[endpoint].UpstreamCert?.CertChain" color="#00adef">
																	<SafetyCertificateFilled  class="font-green"/>
																</a-tooltip>
															</div>
															<div class="flex-item nowrap" v-if="!!json.Services[service].Endpoints[endpoint].UpstreamCert.PrivateKey">Private Key
																<a-tooltip :title="json.Services[service].Endpoints[endpoint].UpstreamCert?.PrivateKey" color="#00adef">
																	<SafetyCertificateFilled class="font-green"/>
																</a-tooltip>
															</div>
															<div class="flex-item nowrap" v-if="!!json.Services[service].Endpoints[endpoint].UpstreamCert.IssuingCA">Issuing CA
																<a-tooltip :title="json.Services[service].Endpoints[endpoint].UpstreamCert?.IssuingCA" color="#00adef">
																	<SafetyCertificateFilled class="font-green"/>
																</a-tooltip>
															</div>
														</div>
													</div>
												</a-space>
												
											</li>
										</ol>
									</div>
								</div>
							</div>
							<div class="flex" v-if="json.Services[service].Filters">
								<b class="flex-item nowrap">Filters</b>
								<div class="flex-item" style="flex: 5;">
									<div class="endpoint-block" >
										<ul class="mt-10">
											<li class="mb-10" v-for="(filter) in json.Services[service].Filters">
												<a-popover>
													<template #content>
														<p v-for="(filterKey) in Object.keys(filter)"><b>{{filterKey}}</b>: <a-tag>{{filter[filterKey]}}</a-tag></p>
													</template>
													<a>{{filter.Type}}</a>
												</a-popover>
											</li>
										</ul>
									</div>
								</div>
							</div>
							<div class="flex" v-if="json.Services[service].HealthCheck">
								<b class="flex-item nowrap">Health Check</b>
								<div class="flex-item" style="flex: 5;">
									<a-tag v-for="(HealthCheckKey) in Object.keys(json.Services[service].HealthCheck)"> {{HealthCheckKey}}: {{json.Services[service].HealthCheck[HealthCheckKey]}}</a-tag>
								</div>
							</div>
              <div class="float-right">
                <DeleteOutlined @click="remove('Service',service)"  class="icon-menu vm " />
                <UpOutlined @click="displayMap[`service-${service}`] = false" class="icon-menu vm "/>
							</div>
						</div>
					</a-timeline-item>
				</a-timeline>
			</section>
			<section v-if="json.Certificate">
				<h4><SettingFilled class="gray" /> Certificate</h4>
				<div  class="config-block flex mb-20" >
					<b class="flex-item">Cert Chain</b>
					<div class="width-60">
						<a-tooltip :title="json.Certificate?.CertChain" color="#00adef">
							<SafetyCertificateFilled v-if="!!json.Certificate.CertChain" class="font-green"/><b v-else>-</b>
						</a-tooltip>
					</div>
					<b class="flex-item">Private Key</b>
					<div class="width-60">
						<a-tooltip :title="json.Certificate?.PrivateKey" color="#00adef">
							<SafetyCertificateFilled v-if="!!json.Certificate.PrivateKey" class="font-green"/><b v-else>-</b>
						</a-tooltip>
					</div>
					<b class="flex-item">Issuing CA</b>
					<div class="width-60">
						<a-tooltip :title="json.Certificate?.IssuingCA" color="#00adef">
							<SafetyCertificateFilled v-if="!!json.Certificate.IssuingCA" class="font-green"/><b v-else>-</b>
						</a-tooltip>
					</div>
				</div>
			</section>
			
			<section v-if="json.Chains">
				<h4><SettingFilled class="gray" /> Chains</h4>
				<div class="config-block flex mb-20" >
					<a-row class="full">
						<a-col :span="8" v-for="(chainKey) in Object.keys(json.Chains)">
							<a-tree
								:defaultExpandAll="true"
								:tree-data="treeData(chainKey, json.Chains[chainKey])"
							/>
						</a-col>
					</a-row>
				</div>
			</section>
		</div>
	</div>
</template>

<style scoped>
.listener-block,.config-block {
  border: 2px solid #00adef;
	border-radius: 10px;
	padding:5px 5px;
}
.service-block{
  border: 2px solid lightseagreen;
	border-radius: 10px;
	padding: 10px;
}
.service-block b,.service-block div{
	padding: 5px;
}
.route-block {
  border: 2px dashed #00adef;
	margin: 15px 15px 15px 0;
	border-radius: 10px;
	padding:15px 5px 5px 5px;
}
.endpoint-block{
  border: 2px dashed lightseagreen;
	border-radius: 10px;
}
.config-block b,.config-block>div{
	padding: 10px;
}
section{
	margin-bottom: 10px;
}
.block-item{
	white-space: nowrap;
	background-color: #f5f5f5;
	line-height: 34px;
	height: 34px;
	display: inline-block;
	padding: 0 10px 0 5px;
	border-radius: 5px;
	font-weight: bold;
}
.service-block.all{
	padding-bottom: 50px !important;
}
</style>
