var queues = new function() {

    var myQueuesTable;
    var queuesTable;
    var ticketsTable;
    var SORTING = [[3, 'desc'], [2, 'desc'], [0, 'asc']];
    var queuePopovers = [];

    /*
     * keepCalling should be set to true to have this function call itself every 30 secs.
     * sessvars.queueTimer can be used to stop the call
     */
    this.updateQueues = function(keepCalling) {
        if(!servicePoint.getWorkstationOffline() && servicePoint.hasValidSettings()) {

            if(typeof queuesTable !== 'undefined' && typeof myQueuesTable !== 'undefined') {
                // All Queues
                queuesTable.fnClearTable();
                var queuesData = spService.get("branches/" + sessvars.branchId + "/queues") 
                if(queuesData.length > 0) {
                    queuesTable.fnAddData(queuesData);
                }
                allQueuesInitFn(queuesData);

                // My Queues
                myQueuesTable.fnClearTable();
                var myQueuesData = myQueuesFilterFn(queuesData);
                if(myQueuesData.length > 0) {
                    myQueuesTable.fnAddData(myQueuesData);
                }
                myQueuesInitFn(myQueuesData);
                
            } else {
                var columns = [
                    /* Queue name */        {"sClass": "qm-table__first-column",
                        "mDataProp": "name",
                        "sType": "qm-sort",
                        "sDefaultContent" : null},
                    /* Queue id */          {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "id",
                        "sDefaultContent" : null},
                    /* Queue serviceLevel */          {"bSearchable": false,
                        "bVisible": false,
                        "mDataProp": "serviceLevel",
                        "sDefaultContent" : null},
                    /* Queue waiting num */ {"sClass": "qm-table__middle-column qm-table__middle-column--right-align",
                        "mDataProp": "customersWaiting",
                        "sType": "qm-sort",
                        "sDefaultContent" : null},
                    /* Queue waiting time */{"sClass": "qm-table__last-column",
                        "mDataProp": "waitingTime",
                        "sType": "qm-sort",
                        "sDefaultContent" : null}
                ];
                var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n.prop('info.queue.name');
                    nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n.prop('info.queue.waiting');
                    nHead.getElementsByTagName('th')[2].innerHTML = jQuery.i18n.prop('info.queue.waiting.time');
                };
				var t= new Date();
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues?call="+t;
                var rowCallbackAllQueues = function(nRow, aData, iDisplayIndex) {
                    if(sessvars.state.servicePointState == servicePoint.servicePointState.OPEN &&
                        !(servicePoint.isOutcomeOrDeliveredServiceNeeded() /*&& sessvars.forceMark && !hasMark()*/)) {
                        var queueName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<a href='' class=\"qm-table__queue-name\" " +
                            "title=\"" + jQuery.i18n.prop("action.title.queue.click") + "\">" + queueName + "</a>");
        
                        $('td:eq(0) > a.qm-table__queue-name', nRow).click(function(e) {
                            e.preventDefault();
                            //queueClicked(queuesTable, nRow, aData);
                        });
                    } else {
                        $('td:eq(0)', nRow).addClass("qm-table__queue-name--disabled");
                    }

                    
                    if(aData.customersWaiting === 0) {
                        $('td:eq(2)', nRow).html("--");
                        $('td:eq(1)', nRow).html("<span class='qm-no-waiting'></span> Kein Wartender");
                    } else {
                        $('td:eq(2)', nRow).html(util.formatIntoMM(parseInt(aData.waitingTime)));
                        $('td:eq(1)', nRow).html("<span class='qm-waiting'></span> Wartende vorhanden");
                    }
                    setSLAIcon(aData.serviceLevel, aData.waitingTime, nRow);
                    
                    return nRow;
                }; 

                var rowCallbackMyQueues = function(nRow, aData, iDisplayIndex) {
                    if(sessvars.state.servicePointState == servicePoint.servicePointState.OPEN &&
                        !(servicePoint.isOutcomeOrDeliveredServiceNeeded() /*&& sessvars.forceMark && !hasMark()*/)) {
                        var queueName = $('td:eq(0)', nRow).text();
                        $('td:eq(0)', nRow).empty().append("<a href='' class=\"qm-table__queue-name\" " +
                            "title=\"" + jQuery.i18n.prop("action.title.queue.click") + "\">" + queueName + "</a>");
        
                        $('td:eq(0) > a.qm-table__queue-name', nRow).click(function(e) {
                            e.preventDefault();
                            //queueClicked(myQueuesTable, nRow, aData);
                        });
                    } else {
                        $('td:eq(0)', nRow).addClass("qm-table__queue-name--disabled");
                    }

                    if(aData.customersWaiting === 0) {
                        $('td:eq(2)', nRow).html("--");
                        $('td:eq(1)', nRow).html("<span class='qm-no-waiting'></span> Kein Wartender");
                    } else {
                        $('td:eq(2)', nRow).html(util.formatIntoMM(parseInt(aData.waitingTime)));
                        $('td:eq(1)', nRow).html("<span class='qm-waiting'></span> Wartende vorhanden");
                    }

                    setSLAIcon(aData.serviceLevel, aData.waitingTime, nRow);
                    return nRow;
                }; 

                queuesTable = util.buildTableJson({"tableId": "queues", "url": url, "rowCallback": rowCallbackAllQueues,
                    "columns": columns, "filter": false, "headerCallback": headerCallback, "emptyTableLabel": "info.queues.none", "scrollYHeight": "100%", "initFn": allQueuesInitFn});
                queuesTable.fnSort(SORTING);
                queuesTable.fnAdjustColumnSizing();

                myQueuesTable = util.buildTableJson({"tableId": "myQueuesTable", "url": url, "rowCallback": rowCallbackMyQueues,
                "columns": columns, "filter": false, "headerCallback": headerCallback, "emptyTableLabel": "info.queues.none", "scrollYHeight": "100%", "filterData": myQueuesFilterFn, "initFn": myQueuesInitFn});
                myQueuesTable.fnSort(SORTING);
                myQueuesTable.fnAdjustColumnSizing();
            }

            tableScrollController.initTableScroll("queues");
            tableScrollController.initTableScroll("myQueuesTable");

            // Sadly clearing and adding data to the queue "data table" resets the position of our search result
            customer.positionCustomerResult();
        }
        
        if(keepCalling) {
            if(sessvars.queueTimer !== undefined) {
                clearTimeout(sessvars.queueTimer);
                sessvars.queueTimer = undefined;
            }
            sessvars.queueTimer = setTimeout(function() {
                queues.updateQueues(true);
            }, queueRefreshTime*1000);
        }
    };

    var setSLAIcon = function(serviceLevel, waitingTime, nRow) {
        if(serviceLevel && serviceLevel !== 0) { 
            var waitingTimeInMinutes = 0
            if(waitingTime && waitingTime !== 0) {
                waitingTimeInMinutes = waitingTime / 60;
            
                if(waitingTimeInMinutes < serviceLevel * 0.75) {
                    $(nRow).addClass('qm-sla qm-sla--normal');
                } else if(waitingTimeInMinutes >= serviceLevel * 0.75
                    && waitingTimeInMinutes <= serviceLevel * 0.99) {
                    $(nRow).addClass('qm-sla qm-sla--warning');
                } else {
                    $(nRow).addClass('qm-sla qm-sla--danger');
                }
            }
        }
    }

    var allQueuesInitFn = function (queues) {
        var waitingCustomers = getNumberOfWaitingCustomers(queues);
        setNumberOfWaitingCustomers('#allQueuesTab .qm-tab-information__text', waitingCustomers);
    };

    var myQueuesInitFn = function (queues) {
        var waitingCustomers = getNumberOfWaitingCustomers(queues);
        setNumberOfWaitingCustomers('#myQueuesTab .qm-tab-information__text', waitingCustomers);
    };

    var queueDetailInitFn = function (queues) {
        var waitingCustomers = queues.length;
        setNumberOfWaitingCustomers('#queueDetailView .qm-tab-information__text', waitingCustomers);
    };

    var getNumberOfWaitingCustomers = function (queues) {
        return _.reduce(queues, function(sum, queue) {
            return sum + queue.customersWaiting; 
        }, 0);
    };

    var setNumberOfWaitingCustomers = function(selector, numberOfWaitingCustomers) {
        if(numberOfWaitingCustomers > 0){
            $(selector).html("<span class='qm-waiting'></span> Wartende vorhanden");
        }else{
            $(selector).html("<span class='qm-no-waiting'></span> Kein Wartender");
        }
    };

    var myQueuesFilterFn = function (queues) {
        var myQueueIds = window.myQueueIds || [];
        return _.filter(queues, function (queue) {
            return _.includes(window.myQueueIds, queue.id);
        });
    };

    var queueClicked = function(queueTableContainingRow, rowClicked, rowAData) {
        debugger;
        if(servicePoint.hasValidSettings() && sessvars.state.servicePointState == servicePoint.servicePointState.OPEN &&
            !(servicePoint.isOutcomeOrDeliveredServiceNeeded() /*&& sessvars.forceMark && !hasMark()*/)) {
            sessvars.clickedQueueId = queueTableContainingRow.fnGetData(rowClicked).id; //ql queue id
            
            queueViewController.navigateToDetail();
            
            if(typeof ticketsTable !== 'undefined') {
                //empty the tickets table and populate with new data from server if table is not created
                ticketsTable.fnClearTable();
                ticketsTable.fnSort([]);
                var params = {};
                params.branchId = sessvars.branchId;
                params.queueId = sessvars.clickedQueueId;
                var tickets = spService.get("branches/" + params.branchId + "/queues/" + params.queueId + "/visits/full");
         
                // util.sortArrayCaseInsensitive(tickets, "ticketId");
                if(tickets.length > 0) {
                    ticketsTable.fnAddData(tickets);
                }
                queueDetailInitFn(tickets);
            } else {
                var columns = [
                    /* Id */                {"bSearchable": false,
                        "bVisible": false,
                        "sType": "qm-sort",
                        "mDataProp": "id"},

                    /* Ticket id */         {"sClass": "qm-table__first-column",
                    "sType": "qm-sort",
                    "sWidth": "",
                        "mDataProp": "ticketId"},
                    /* Customer name */
                        {"sClass": "qm-table__middle-column",
                        "sType": "qm-sort",
                        "mData": null,
                        "sWidth": "",
                        "sDefaultContent": ""},
                    /* Actions */      {"sClass": "qm-table__middle-column",
                        "mDataProp": "currentVisitService.serviceExternalName",
                        "sWidth": ""
                    },
                        /* Appointment time */      {"sClass": "qm-table__app-column",
                        // "bVisible": false,
                    "sType": "qm-sort",
                    "sWidth": "",
                        "mDataProp": "appointmentTime"},
                    /* Waiting time */      {"sClass": "qm-table__last-column",
                    "sType": "qm-sort",
                    "sWidth": "",
                        "mDataProp": "waitingTime"}

                ];
                var headerCallback = function(nHead, aasData, iStart, iEnd, aiDisplay) {
                    nHead.getElementsByTagName('th')[0].innerHTML = jQuery.i18n.prop('info.queue.ticket');
                    nHead.getElementsByTagName('th')[1].innerHTML = jQuery.i18n.prop('info.queue.customer.name');
                    nHead.getElementsByTagName('th')[2].innerHTML = jQuery.i18n.prop('info.service.name');
                    nHead.getElementsByTagName('th')[3].innerHTML = jQuery.i18n.prop('info.queue.appointment.time');
                    nHead.getElementsByTagName('th')[4].innerHTML = jQuery.i18n.prop('info.queue.waiting.time');
                };
                var t = new Date();
                var url = "/rest/servicepoint/branches/" + sessvars.branchId + "/queues/" + sessvars.clickedQueueId + "/visits/full?call=" + t;
                var rowCallback = function(nRow, aData, iDisplayIndex) {
                    
                    if($('td:eq(0)', nRow).find('a').length == 0) {
                        if(iDisplayIndex === 0) {
                            clearQueuePopovers();
                        }
                        //format ticket number
                        var ticketNumSpan = $("<a href='#' class='qm-table__ticket-code'>" + aData.ticketId + "</a>")
                        $('td:eq(0)', nRow).html(ticketNumSpan);
                        
                        setSLAIcon(rowAData.serviceLevel, aData.waitingTime, nRow);

                        if(!buttonCallFromQueueEnabled && !buttonTransferFromQueueEnabled && !buttonRemoveFromQueueEnabled) {
                            ticketNumSpan.addClass('qm-table__ticket-code--disabled');
                        } else {
                            // Templates
                            var popoverTemplate = document.querySelector('.qm-popover--queue').outerHTML.trim();
                            
                            // Popover options
                            var options = {
                                template: popoverTemplate,
                                popTarget: ticketNumSpan.get(0),
                                ticketId: aData.ticketId,
                                visitId: aData.id
                            };
                            
                            // Popover options and initialization
                            if ( buttonTransferFromQueueEnabled  == true ) {						
                                options.showTransferBtn = true;
                            } else {
                                options.showTransferBtn = false;
                            }
                            if ( buttonRemoveFromQueueEnabled == true ) {
                                options.showDeleteBtn = true;
                            } else {
                                options.showDeleteBtn = false;
                            }
                            if ( buttonCallFromQueueEnabled == true ) {						
                                options.showCallBtn = true;
                            } else {
                                options.showCallBtn = false;
                            }
                            
                            if(servicePoint.isOutcomeOrDeliveredServiceNeeded()) {
                                options.disableCall = true;
                                options.disableTransfer = true;
                                options.disableDelete = true;
                            }

                            var popover = new window.$Qmatic.components.popover.QueuePopoverComponent(options);
                            popover.init();
                            
                            queuePopovers.push(popover);
                        }

                        var formattedTime = util.formatIntoMM(parseInt(aData.waitingTime));
                    }

                    if(aData.parameterMap && aData.parameterMap['customers'] !== undefined) {
                        $('td:eq(1)', nRow).html(aData.parameterMap['customers']);
                        
                    }
                    if(aData.parameterMap && aData.parameterMap['kioskData_cname'] !== undefined) {
                        var rowHtml = $('td:eq(1)', nRow).html();
                        $('td:eq(1)', nRow).html(rowHtml + "<div class='company-name'>" + aData.parameterMap['kioskData_cname'] + "</div>"); 
                    }
                    if(aData.appointmentTime) {
                        $('td:eq(3)', nRow).html(util.formatHHMMSSIntoHHMMA(aData.appointmentTime.split("T")[1]));
                    }

                    $('td:eq(4)', nRow).html(formattedTime);
                    return nRow;
                };

                //create new table since not defined
                ticketsTable = util.buildTableJson({"tableId": "tickets", "url": url, "rowCallback": rowCallback,
                    "columns": columns, "filter": false, "headerCallback": headerCallback, "scrollYHeight": "100%",
                    "emptyTableLabel": "info.queue.tickets.empty", "initFn": queueDetailInitFn});
                // ticketsTable.fnSort([[1, 'asc']]);

                tableScrollController.initTableScroll("tickets");
            }

            var $ticketListHeader = $("#ticketListHeader");
            $ticketListHeader.empty();
            $ticketListHeader.html(queueTableContainingRow.fnGetData(rowClicked).name);

            adjustHeightOfTableScrollWrapper('#queueDetailView');
        }
    };

    var adjustHeightOfTableScrollWrapper = function (id) {
        var $wrapper = $(id),
            $scrollBody = $wrapper.find('.dataTables_scrollBody');
            scrollHeaderHeight = $wrapper.find('.dataTables_scrollHead').height();
        $scrollBody.css('height', 'calc(100% - ' + scrollHeaderHeight + 'px');
    }

    var clearQueuePopovers = function () {
        if(queuePopovers && queuePopovers.length > 0) {
            for(var i = 0; i < queuePopovers.length; i++) {
                queuePopovers[i].disposeInstance();
            }
        }
        queuePopovers = [];
    };

    this.runClearQueuePopovers = function () {
        clearQueuePopovers();
    };

    this.emptyQueues = function() {
        queuesTable.fnClearTable();
        myQueuesTable.fnClearTable();
    };

    this.removeTicket = function (visitId, ticketId) {
        if(servicePoint.hasValidSettings()) {
            var params = servicePoint.createParams();
            params.queueId = sessvars.clickedQueueId;
            params.visitId = visitId;
            spService.del("branches/"+params.branchId+"/servicePoints/"+params.servicePointId+"/visits/"+params.visitId);
            queues.updateQueues(false);
            util.showMessage(translate.msg("info.successful.delete", [ticketId]), false);
        }
    };

    this.callFromQueue = function (visitId) {
        if(servicePoint.hasValidSettings()) {
            var params = servicePoint.createParams();
            params.queueId = sessvars.clickedQueueId;
            params.visitId = visitId;
			userPoolUpdateNeeded = false;
			spPoolUpdateNeeded = false;
			sessvars.state = servicePoint.getState(spService.post("branches/"+params.branchId+"/servicePoints/"+params.servicePointId+"/visits/"+params.visitId));
			queues.updateQueues(false);
			if (sessvars.state.visitState == "CALL_NEXT_TO_QUICK") {
				util.showError(jQuery.i18n.prop("info.call.next.to.quick"));
			} else {
				sessvars.statusUpdated = new Date();
				servicePoint.updateWorkstationStatus();
				sessvars.currentCustomer = null;
			}
        }
    };
};