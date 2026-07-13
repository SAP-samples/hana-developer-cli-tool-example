import{H as e}from"./index-6hg61Of-.js";function t(){let{fetchDirect:t,execute:n}=e();async function r(e){return t(`/hana/calcview/project/list?path=${encodeURIComponent(e)}`)}async function i(e,n){let r=`/hana/calcview/project/read?file=${encodeURIComponent(e)}`;return n&&(r+=`&base=${encodeURIComponent(n)}`),t(r)}async function a(e,t,n){let r=await fetch(`/hana/calcview/project/write`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({file:e,xml:t,base:n})});if(!r.ok){let e=await r.json().catch(()=>({error:r.statusText}));throw Error(e.error||`${r.status} ${r.statusText}`)}return r.json()}async function o(){try{return await n(`calcViews`)}catch{return[]}}return{listProjectFiles:r,readProjectFile:i,writeProjectFile:a,listRuntimeViews:o}}function n(e){let{name:t,dataCategory:n,description:r,initialNode:i}=e,a=``,o=``;if(i!==`none`){let e={projection:`Calculation:ProjectionView`,aggregation:`Calculation:AggregationView`,join:`Calculation:JoinView`}[i]||`Calculation:ProjectionView`,t=`${i.charAt(0).toUpperCase()+i.slice(1)}_1`;a=`
    <calculationView xsi:type="${e}" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" id="${t}">
      <viewAttributes/>
      <input/>
    </calculationView>`,o=`
      <shape expanded="true" modelObjectName="${t}" modelObjectNameSpace="CalculationView">
        <upperLeftCorner x="200" y="250"/>
      </shape>`}return`<?xml version="1.0" encoding="UTF-8"?>
<Calculation:scenario xmlns:Calculation="http://www.sap.com/ndb/BiModelCalculation.ecore" id="${t}" applyPrivilegeType="NONE" dataCategory="${n}">
  <descriptions defaultDescription="${r}"/>
  <localVariables/>
  <variableMappings/>
  <dataSources/>
  <calculationViews>${a}
  </calculationViews>
  <logicalModel${i===`none`?``:` id="${i.charAt(0).toUpperCase()+i.slice(1)}_1"`}>
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
      </shape>${o}
    </shapes>
  </layout>
</Calculation:scenario>`}export{t as n,n as t};