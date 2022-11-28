function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useEffect, useState } from 'react'; // import { getCategoricalSchemeRegistry } from '@superset-ui/core';

import BullectChart from './plugin/bullet'; // const categorialSchemeRegistry = getCategoricalSchemeRegistry();
// The following Styles component is a <div> element, which has been styled using Emotion
// For docs, visit https://emotion.sh/docs/styled
// Theming variables are provided for your use via a ThemeProvider
// imported from @superset-ui/core. For variables available, please visit
// https://github.com/apache-superset/superset-ui/blob/master/packages/superset-ui-core/src/style/index.ts

/**
 * ******************* WHAT YOU CAN BUILD HERE *******************
 *  In essence, a chart is given a few key ingredients to work with:
 *  * Data: provided via `props.data`
 *  * A DOM element
 *  * FormData (your controls!) provided as props by transformProps.ts
 */

export default function SupersetBulletChartV5(props) {
  // height and width are the height and width of the DOM element as it exists in the dashboard.
  // There is also a `data` prop, which is, of course, your DATA 🎉
  var [chartData, setchartData] = useState({
    data: props.data,
    height: props.height,
    width: props.width,
    colorScheme: props.colorScheme,
    orderDesc: props.orderDesc,
    bulletColorScheme: props.bulletColorScheme
  }); // find unique company and period key value pair

  var findUniqueCompanyAndPeriod = function findUniqueCompanyAndPeriod(arrayInput, keys) {
    if (arrayInput === void 0) {
      arrayInput = [];
    }

    if (keys === void 0) {
      keys = [];
    }

    if (!Array.isArray(arrayInput)) {
      throw new TypeError("Expected an array for arrayInput, got " + typeof arrayInput);
    }

    if (!Array.isArray(keys)) {
      throw new TypeError("Expected an array for keys, got " + typeof keys);
    }

    var keyValues = arrayInput.map(value => {
      var key = keys.map(k => value[k]).join('|');
      return [key, value];
    });
    var kvMap = new Map(keyValues);
    return [...kvMap.values()];
  };

  var uniqueCompanyPeriod = findUniqueCompanyAndPeriod(chartData.data, ['period', 'company']); //

  var addYearToRecord = uniqueCompanyPeriod => {
    var records = [];
    chartData.data.forEach(d => {
      records.push(_extends({}, d, {
        year: parseInt(d.period.substr(d.period.length - 4))
      }));
    });
    /*     records.sort(function (a: any, b: any) {
      return a.company.localeCompare(b.company) || b.year - a.year;
    }); */

    return records;
  }; // collect records for each uniqueCompanyPeriod


  var findRecordsForuniqueCompanyPeriod = (uniqueCompanyPeriod, yearAddedRecords) => {
    var records = [];
    uniqueCompanyPeriod.forEach(ucp => {
      var search = yearAddedRecords.filter(cd => cd.company === ucp.company && cd.period === ucp.period);
      records.push(search);
    });
    records.sort(function (a, b) {
      if (a[0].company === b[0].company) {
        // Price is only important when cities are the same
        return a[0].year - b[0].year;
      }

      return a[0].company > b[0].company ? 1 : -1;
    });
    return records;
  };

  var companiesData = findRecordsForuniqueCompanyPeriod(uniqueCompanyPeriod, addYearToRecord(chartData.data));
  useEffect(() => {
    setchartData({
      data: props.data,
      height: props.height,
      width: props.width,
      colorScheme: props.colorScheme,
      orderDesc: props.orderDesc,
      bulletColorScheme: props.bulletColorScheme
    });
  }, [props]);
  var newProps = {
    // height: uniquePeriod.length > 1 ? props.height / 1.6 : props.height,
    height: 220,
    colorScheme: props.colorScheme,
    width: props.width,
    orderDesc: props.orderDesc,
    bulletColorScheme: props.bulletColorScheme,
    data: companiesData
  };
  var panelBody = document.querySelector('.panel-body');

  if (panelBody) {
    panelBody.style.overflowY = 'scroll';
  }

  return /*#__PURE__*/React.createElement("div", {
    id: "graphic"
  }, /*#__PURE__*/React.createElement(BullectChart, {
    props: newProps
  }));
}