import React from 'react';import {View,StyleSheet} from 'react-native';import {C} from '../theme/colors';
export default function Frame({children,scroll=false}){return <View style={s.outer}><View style={s.app}>{children}</View></View>};
const s=StyleSheet.create({outer:{flex:1,backgroundColor:'#020409',alignItems:'center'},app:{flex:1,width:'100%',maxWidth:430,backgroundColor:C.bg,overflow:'hidden'}});
