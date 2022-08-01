<?php
//db stuff
//dragon added 2017_11_13
//$conn  = new MongoClient( "mongodb://localhost:27017 ");
//MongoCursor::$timeout = -1;
$cfg = parse_ini_file("../.env");
$conn = new MongoClient("mongodb://" . $cfg['DBHOST'] . ":27017 ");
MongoCursor::$timeout = -1;
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
                   $db = $conn->selectDB("padb");

                $a = $db->accounts->find(array('type' => 'agent'));
                $accsa = array();
                foreach($a as $b){
                    array_push($accsa,$b['_id']);
                }

                //$db.createCollection("yearlycorestats");
                $current_time = time() ;
                $start = ($current_time - (86400 * 7));
                $end = $current_time;
                $obj = array();
                echo "started" . PHP_EOL;
                
               
                $pipe2 = array(
                 array('$match' => array(
                    'account' => array('$in' => $accsa),
                    'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end))
                )),
                 array(
                     '$group' => array(
                         '_id' => '$country',
                         'count' => array('$sum' => 1)
                     )
                 ),
                 array('$sort' => array(
                     'count' => -1
                 )),
                 array('$limit'=>20)
                );
                $res2 = $db->topuplogs->aggregate($pipe2);
                $obj['top10_countries'] = $res2['result'];
                echo "res2" . print_r($res2['result'],true) . PHP_EOL;

                $pipe3 = array(
                 array('$match' => array(
                    'account' => array('$in' => $accsa),
                    'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end))
                    )),
                array(
                     '$group' => array(
                         '_id' => '$account',
                         'count' => array('$sum' => 1)
                     )
                 ),
                 array('$sort' => array(
                     'count' => -1
                 )),
                 array('$limit'=>20)
                );
                $res3 = $db->topuplogs->aggregate($pipe3);
                $obj['top10_accounts'] = $res3['result'];       
                echo "res3" . print_r($res3['result'],true) . PHP_EOL;
                
                if((sizeof($obj['top10_accounts'])==0) || (sizeof($obj['top10_countries'])==0)  ){
                    die('');
                }

                $objarray = array();
                for ($i = 7; $i > 0; $i--) {
                    $start_mo = ($current_time - (86400 * $i));
                    $end_mo = ($start_mo + 86400 );
                    $res6Array = array();
                    $res7Array = array();
                    $res8Array = array();
                    $res9Array = array();

                    for ($j=0;$j<sizeof($res2['result']);$j++){
                        $pipe6 = array(/// top10_countries_topup
                            array('$match' => array(
                                'account' => array('$in' => $accsa),
                                'country' => $obj['top10_countries'][$j]['_id'],
                               'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo))
                           )),
                            array(
                                '$group' => array(
                                    '_id' =>array('country'=>'$country','currency' => '$topup_currency','code'=>'$code','operator_name'=>'$operator_name'),
                                    'count' => array('$sum' => 1),
                                    'amount' => array('$sum' => '$topup_amount')
                                ))
                        );
                        $res6 = $db->topuplogs->aggregate($pipe6);
                        echo "res6" . print_r($res6) . PHP_EOL;
                        for($k = 0;$k<sizeof($res6['result']);$k++){
                            array_push($res6Array,array('_id'=>$res6['result'][$k]['_id']['country'],'count'=>$res6['result'][$k]['count'],
                                            'currency'=>$res6['result'][$k]['_id']['currency'],'amount'=>$res6['result'][$k]['amount'],
                                            'code' => $res6['result'][$k]['_id']['code'],'operator_name' => $res6['result'][$k]['_id']['operator_name']));
                        }
                        echo "res6Array" . print_r(end($res6Array),true) . PHP_EOL;

                        $pipe9 = array(/// top10_countries_paid
                            array('$match' => array(
                                'account' => array('$in' => $accsa),
                                'country' => $obj['top10_countries'][$j]['_id'],
                               'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo))
                           )),
                            array(
                                '$group' => array(
                                    '_id' => array('country'=>'$country','currency' => '$paid_currency','code'=>'$code','operator_name'=>'$operator_name'),
                                    'count' => array('$sum' => 1),
                                    'amount' => array('$sum' => '$paid_amount')
                                ))
                        );
                        $res9 = $db->topuplogs->aggregate($pipe9);
                        for($k = 0;$k<sizeof($res9['result']);$k++){
                            array_push($res9Array,array('_id'=>$res9['result'][$k]['_id']['country'],'count'=>$res9['result'][$k]['count'],
                                    'currency'=>$res9['result'][$k]['_id']['currency'],'amount'=>$res9['result'][$k]['amount'],
                                    'code' => $res9['result'][$k]['_id']['code'],'operator_name' => $res9['result'][$k]['_id']['operator_name']));
                        }
                        echo "res9Array" . print_r(end($res9Array),true) . PHP_EOL;

                    }      

                    for ($j=0;$j<sizeof($res3['result']);$j++){
                        $theObjId = new MongoId($obj['top10_accounts'][$j]['_id']);
                        $item = $db->accounts->findOne(array('_id' => $theObjId));
                        $itemparent = $db->accounts->findOne(array('_id' => $item['parent']));
                        $pipe7 = array(/// top10_accounts_topup
                            array('$match' => array(
                                'account' =>$obj['top10_accounts'][$j]['_id'] ,
                               'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo))
                           )),
                            array(
                                '$group' => array(
                                    '_id' => array('account'=>'$account','currency' => '$topup_currency','code'=>'$code'),
                                    'count' => array('$sum' => 1),
                                    'amount' => array('$sum' => '$topup_amount')
                            ))
                        );
                        $res7 = $db->topuplogs->aggregate($pipe7);
                        for($k = 0;$k<sizeof($res7['result']);$k++){
                            array_push($res7Array,array('_id'=>$res7['result'][$k]['_id']['account'],'account_name' => $item['account_name'],'count'=>$res7['result'][$k]['count'],
                                        'currency'=>$res7['result'][$k]['_id']['currency'],'amount'=>$res7['result'][$k]['amount'],'code'=>$res7['result'][$k]['_id']['code'],
                                        'parentid'=>$itemparent['_id'], 'parentname'=>$itemparent['account_name']));
                        }
                        echo "res7" . print_r(end($res7Array),true) . PHP_EOL;

                        $theObjId = new MongoId($obj['top10_accounts'][$j]['_id']);
                        $item = $db->accounts->findOne(array('_id' => $theObjId));
                        $itemparent = $db->accounts->findOne(array('_id' => $item['parent']));
                        $pipe8 = array(/// top10_accounts_paid
                            array('$match' => array(
                                'account' =>$obj['top10_accounts'][$j]['_id'] ,
                               'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo))
                           )),
                            array(
                                '$group' => array(
                                    '_id' => array('account'=>'$account','currency' => '$paid_currency','code'=>'$code'),
                                    'count' => array('$sum' => 1),
                                    'amount' => array('$sum' => '$paid_amount')
                            ))
                        );
                        $res8 = $db->topuplogs->aggregate($pipe8);
                        for($k = 0;$k<sizeof($res8['result']);$k++){
                            array_push($res8Array,array('_id'=>$res8['result'][$k]['_id']['account'],'account_name' => $item['account_name'],'count'=>$res8['result'][$k]['count'],
                                        'currency'=>$res8['result'][$k]['_id']['currency'],'amount'=>$res8['result'][$k]['amount'],'code'=>$res8['result'][$k]['_id']['code'],
                                        'parentid'=>$itemparent['_id'], 'parentname'=>$itemparent['account_name']));
                        }
                        echo "res8" . print_r(end($res8Array),true) . PHP_EOL;
                    }    
                    
                    $suxx = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo)), 'success' => true))->count();
                    $fail = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo)), 'success' => false))->count();    
                    $ch_web = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo)), 'channel' => 'web'))->count();
                    $ch_api = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo)), 'channel' => 'api'))->count();
                    $ch_pinp = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo)), 'channel' => 'pinp'))->count();
                    $ch_ivr = $db->topuplogs->find(array('account' => array('$in' => $accsa), 'time' => array('$gte' => new MongoDate($start_mo), '$lte' => new MongoDate($end_mo)), 'channel' => 'ivr'))->count();


                    $stats = array();
                    $stats['suxx_vs_fail'] = array('successful' => $suxx, 'failed' => $fail, 'date' => date('m.Y', $start_mo));                    
                    $stats['topups_by_channel'] = array('web' => $ch_web, 'api' => $ch_api, 'pinp' => $ch_pinp, 'ivr' => $ch_ivr, 'date' => date('m.Y', $start));
                    $stats['top10_countries_topup'] =$res6Array;
                    $stats['top10_accounts_topup'] =$res7Array;
                    $stats['top10_accounts_paid'] =$res8Array;
                    $stats['top10_countries_paid'] =$res9Array;
                    $stats['time'] = date('d.m.Y', $start_mo);
                    echo "stats['time']" . $stats['time'] . PHP_EOL;
                    array_push($objarray,$stats);
                }
                $obj['stats'] = $objarray;
                $obj['time'] = new MongoDate();
                $db->weeklycorestats->insert($obj);
                   