import{cW as p}from"./index-BOpWkaoY.js";function w(){const{fetchDirect:n,execute:r}=p();async function s(a){const i=encodeURIComponent(a);return n(`/hana/calcview/project/list?path=${i}`)}async function l(a,i){let o=`/hana/calcview/project/read?file=${encodeURIComponent(a)}`;return i&&(o+=`&base=${encodeURIComponent(i)}`),n(o)}async function e(a,i,o){const t=await fetch("/hana/calcview/project/write",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({file:a,xml:i,base:o})});if(!t.ok){const u=await t.json().catch(()=>({error:t.statusText}));throw new Error(u.error||`${t.status} ${t.statusText}`)}return t.json()}async function c(){try{return await r("calcViews")}catch{return[]}}return{listProjectFiles:s,readProjectFile:l,writeProjectFile:e,listRuntimeViews:c}}function m(n){const{name:r,dataCategory:s,description:l,initialNode:e}=n;let c="",a="";if(e!=="none"){const o={projection:"Calculation:ProjectionView",aggregation:"Calculation:AggregationView",join:"Calculation:JoinView"}[e]||"Calculation:ProjectionView",t=`${e.charAt(0).toUpperCase()+e.slice(1)}_1`;c=`
    <calculationView xsi:type="${o}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="${t}">
      <viewAttributes/>
      <input/>
    </calculationView>`,a=`
      <shape expanded="true" modelObjectName="${t}" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="200" y="250"/>
      </shape>`}return`<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="${r}" applyPrivilegeType="NONE" dataCategory="${s}">
  <descriptions defaultDescription="${l}"/>
  <localVariables/>
  <variableMappings/>
  <dataSources/>
  <calculationViews>${c}
  </calculationViews>
  <logicalModel${e!=="none"?` id="${e.charAt(0).toUpperCase()+e.slice(1)}_1"`:""}>
    <attributes/>
    <calculatedAttributes/>
    <baseMeasures/>
    <calculatedMeasures/>
    <restrictedMeasures/>
  </logicalModel>
  <layout>
    <shapes>
      <shape expanded="true" modelObjectName="Output" modelObjectNameSpace="MeasureGroup">
        <upperLeftCorner x="200" y="50"/>
      </shape>${a}
    </shapes>
  </layout>
</Calculation:scenario>`}export{m as g,w as u};
