<?php
$conn  = new MongoClient( "mongodb://localhost:27017 ");
       			if (!$conn) {
       				die('Error Connecting to DB using driver MongoDB');
       			}
       			$db = $conn->selectDB("padb");
                  $a = $db->accounts->find();
                   foreach ($a as $b) {
                       echo "Account : ".$b['account_name']." Was Created On : ".date('Y-m-d H:i:s', $b['createdAt']->sec).PHP_EOL;
                       $x = $db->accounts->findOne(array('_id' => $b['_id']));
                   $sec = $x['createdAt']->sec;
                   $accstat = [];
                   $day_start = strtotime(date('Y-m-d 00:00:00', $x['createdAt']->sec));
                   $start_of_week = time() - (86400  *7);
                   $day_created = $day_start;
                   $day_end = strtotime(date('Y-m-d 23:59:59', $x['createdAt']->sec));
                   $txperday = [];
                   $topperday = [];
                   $pipe3 = array(
                       array('$match' => array(
                        'account' => $x['_id'],
                        'time' => array('$gte' => new MongoDate($start_of_week), '$lte' => new MongoDate())
                    )),
                    array('$group' => array(
                            '_id' => array('operator_name' => '$operator_name', 'country' => '$country'),
                            'amount' => array('$sum' => 1)
                        )
                    ),
                    array('$sort' => array(
                        'amount' => -1
                    )),
                    array('$limit' => 5)
                   );
                    $pipe4 = array(
                       array('$match' => array(
                        'account' => $x['_id'],
                        'time' => array('$gte' => new MongoDate($start_of_week), '$lte' => new MongoDate())
                    )),
                    array('$group' => array(
                            '_id' => array('operator_name' => '$operator_name', 'country' => '$country'),
                            'amount' => array('$sum' => '$paid_amount')
                        )
                    ),
                    array('$sort' => array(
                        'amount' => -1
                    )),
                    array('$limit' => 5)
                   );
                   $res3 = $db->topuplogs->aggregate($pipe3);
                   $res4 = $db->topuplogs->aggregate($pipe4);
                   
                   $top5 = [];
                   $top5amt = [];
                   $resu = [];
                   $resu2 = [];
                   foreach ($res3['result'] as $r) {

                       $top5[$r['_id']['operator_name']] = array($r['_id']['operator_name'], $r['_id']['country']);
                       echo "TOP5n".print_r($r, true).PHP_EOL;
                       
                   }
                   foreach ($res4['result'] as $r) {
                       $top5amt[$r['_id']['operator_name']] = array($r['_id']['operator_name'], $r['_id']['country']);
                       
                   }
                   $pipe6 = array(
                        array('$match' => array(
                        'account' => $x['_id'],
                        'time' => array('$gte' => new MongoDate($start_of_week), '$lte' => new MongoDate())
                    )),
                    array(
                        '$group' => array(
                            '_id' => '$code',
                            'count' => array('$sum' => 1),
                            'amount' => array('$sum' => '$paid_amount')
                        )
                    ),
                    array('$sort' => array(
                        'count' => -1
                    )),
                    array('$limit' => 5)
                   );

                   $res6 = $db->topuplogs->aggregate($pipe6);
                   $dstats = array();
                   for ($i=7; $i > 0; $i--) {

                       $dresu= array();
                           $start = (time() - (86400 * $i));
                           $end = ($start + 86400);
                           foreach ($top5 as $entry) {
                               echo "ENTRY TOP5 ".$entry[0].PHP_EOL;
                               $z = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'operator_name' => $entry[0]))->count();
                              $resu[$entry[0]] = array(
                                  'country' => $entry[1],
                                  'operator_name' => $entry[0],
                                  'count' => $z,
                                  'date' => date('d.m.Y', $start)
                              );


                           }
                           echo "ENTRY0 ".print_r($resu, true).PHP_EOL;
                           foreach($top5amt as $entry) {
                               echo "ENTRY TOP5 AMT ".$entry[0].PHP_EOL;
                               $z = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'operator_name' => $entry[0]));
                               $amt = 0;
                               foreach ($z as $l) {
                                   $amt += (float)$l['paid_amount'];
                               }
                              $resu2[$entry[0]] = array(
                                  'country' => $entry[1],
                                  'operator_name' => $entry[0],
                                  'amount' => $amt,
                                  date('d.m.Y', $start)
                              );
                           }
                           //success vs failed
                           $suxx = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'success' => true ))->count();
                           $fail = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'success' => false ))->count();
                           $ch_web = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'web' ))->count();
                           $ch_api = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'api' ))->count();
                           $ch_pinp = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'pinp' ))->count();
                           $ch_ivr = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'channel' => 'ivr' ))->count();
                           $ov = $db->topuplogs->find(array('account' => $x['_id'], 'time' => array('$gte' => new MongoDate($start), '$lte' => new MongoDate($end)), 'success' => true ))->count();
                           $dresu[$i]['top5_dest_count'] = $resu;
                           $dresu[$i]['top5_dest_amount'] = $resu2;
                           $dresu[$i]['suxx_vs_fail'] = array('successful' => $suxx, 'failed' => $fail, 'date' => date('d.m.Y', $start));
                           $dresu[$i]['topups_by_channel'] = array('web' => $ch_web, 'api' => $ch_api, 'pinp' => $ch_pinp, 'ivr' => $ch_ivr, 'date' => date('d.m.Y', $start));
                           $dresu[$i]['amounts_by_code'] = $res6['result'];
                           array_push($dstats, $dresu[$i]);
                       }
                       print_r($dstats);
                       
                       $ins = array(
                           'account' => $x['_id'],
                           'time' => new MongoDate(),
                           'stats' => $dstats
                       );
                       $db->weeklystats->insert($ins);
                   }
                
                   