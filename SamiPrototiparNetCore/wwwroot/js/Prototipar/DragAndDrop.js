var appPrototipar = (
    function (doc, padre) {
        var ovariables = {
            bool_ctrl_seleccionado: false,
            objSource_Form: null,
            objSource_delascolumnas: null,
            coordenadaInicialSeleccionadaJson: { fila: 0, columna: 0 },
            contadorInputSeleccionado: 0,
            direccionInputSeleccionado: '',
            arrNumeracionInputsSeleccionadosFila_o_Columna: [],
            boolIconsInputColumnasSeleccionado: false
        }

        // :funciones :fun
        function ArrayElementos({ id, clase }) {
            return Array.from(document.getElementById(id).getElementsByClassName(clase));
        }

        function ParentNode({ elemento, level }) {
            let parent = elemento;
            while (level) {
                parent = parent.parentNode;
                level--;
            }
            return parent;
        }

        function setEvents({ elements, events }) {
            elements.forEach(element => {
                events.forEach(evento => {
                    element.addEventListener(evento.event, evento.func);
                });
            });
        }

        function _(id) {
            return doc.getElementById(id);
        }



        function EventDragLeave(event) {
            this.classList.remove('cls_over_div_drop');
        }

        // :pending
        function load() {
            ArrayElementos({ id: 'columna_columns', clase: 'cls_input_drag' })
                .forEach(x => {
                    x.addEventListener("dragstart", (event) => {
                        handleDragStart(event,[])
                    });
                    x.addEventListener("dragend", handlerDragEndIconsInput);
                });

            _("spn_columna").addEventListener("click", fn_visualizar_section_columnasfilas, false);

            setEvents({
                elements: [_("div_row_where_drop")],
                events: [{ event: "dragover", func: handlerDragOverColumnas }, { event: "drop", func: handleDropColumnas }, { event: "dragleave", func: EventDragLeave }]
            });

            setEvents({
                elements: [_("body_columns_3cero")],
                events: [{ event: "keydown", func: fn_keydown_articulo }, { event: "keyup", func: fn_keyup_articulo }]
            });

            ArrayElementos({ id: 'body_columns_3cero', clase: 'cls_div_form' })
                .forEach(x => {
                    x.addEventListener('dragstart', handlerDragStarForm, false);
                    x.addEventListener('dragend', handlerDragEndForm, false);
                });

            handler_divform_elegido_drop();
        }

        function arrayInicioFin(fin,inicio=1) {
            let arr = [];
            for (let _ini = 1; _ini <= fin; _ini++) {
                arr.push(_ini)
            }
            return arr;
        }

        function getTemplateRow(nroFilas, nroColumnas) {
            const arrFilas = arrayInicioFin(nroFilas);
            return arrFilas.map(() => { return `<div class="form-group row div_drop" data-nrofila='${nroFilas}' data-nrocolumna='${nroColumnas}'>
                            <p>Arrastrar aqui</p> </div>`}).join('');
        }

        function getTemplatesRow(nroColumna, nrofilas) {
            const arrColumnas = arrayInicioFin(nroColumna);
            return arrColumnas.map(columna => {
               return `<div class="col cls_div_columnas_filas">
                            ${ getTemplateRow(nrofilas, columna)}
                        </div>`;
            }).join('');            
        }

        /*EMPIEZA EL ARRASTRE DE FILAS Y COLUMNAS*/
        function handleDragStart(e) {
            e.dataTransfer.effectAllowed = 'move';
            const o = e.currentTarget;
            const esBotonConfigurarColumna = o.classList.contains("_botonConfigurarColumna");
            const [nrocolumnas, nrofilas, inputtype] = [o.getAttribute("data-nrocolumnas"), o.getAttribute("data-nrofilas"), o.getAttribute("data-inputtype")];
            
            const template = esBotonConfigurarColumna
                                ? getTemplatesRow(nrocolumnas, nrofilas)
                                : fn_get_html_seguninputtype(inputtype); //:pending
            if (esBotonConfigurarColumna)  ovariables.boolIconsInputColumnasSeleccionado = true;
            e.dataTransfer.setData('iconinputs', template);
        }
        function handlerDragEndIconsInput(e) {
            ArrayElementos({ id: 'body_columns_3cero', clase: 'cls_over_div_drop' })
                .forEach(x => {
                    x.classList.remove('cls_over_div_drop');
                });
            ovariables.boolIconsInputColumnasSeleccionado = false;
        }

        /* AL SOLTAR LAS FILAS Y COLUMNAS*/
        function handlerDragOverColumnas(e) {
            if (e.preventDefault) e.preventDefault();
            if (ovariables.boolIconsInputColumnasSeleccionado) this.classList.add('cls_over_div_drop');
        }

        function handleDropColumnas(e) {
            if (e.preventDefault) e.preventDefault();

            if (ovariables.objSource_delascolumnas === null && ovariables.boolIconsInputColumnasSeleccionado) {
                let div_form = ParentNode({ elemento: this, level: 3 });
                this.innerHTML = e.dataTransfer.getData("iconinputs");

                let cls_div_form_generado = div_form.getAttribute('data-divformgenerado');
                handler_divdrop(cls_div_form_generado);
                fn_setear_despues_add_columnas_filas(cls_div_form_generado);
            }
        }

        /*PARA EL DIV FOR*/
        /*INICIO FORM*/
        function handlerDragStarForm(e) {
            let o = e.currentTarget;
            e.dataTransfer.effectAllowed = 'move';

            let html = o.outerHTML;
            ovariables.objSource_Form = o;
            e.dataTransfer.setData('htmlform', html);
        }

        //// DIV Chosen ORIGEN
        function handlerDragEndForm(e) {
            ovariables.objSource_Form = null;
            //// AL FINALIZAR EL ARRASTRE DEL DIV FOR QUITAR LA CLASE 
            ArrayElementos({ id: 'body_columns_3cero', clase: 'cls_divform_elegido_drop' })
                .forEach(x => x.classList.remove('cls_over_div_drop'));
        }

        function handlerDragOver_DivFormElegidoDrop(e) {
            if (e.preventDefault) e.preventDefault();

            e.dataTransfer.dropEffect = 'move';
            //// PARA BORDE DEL DIV CUANDO SE SOBREPONE EL MOUSE EN EL DIV DONDE SE SOLTARÁ
            if (ovariables.objSource_Form) this.classList.add('cls_over_div_drop');
        }


        function GetArraySeleccionMultiple({ elemento, clase }) {
            let indiceInicialCoordenada = 0;
            let arrFilasColumnas = [];
            Array.from(elemento.getElementsByClassName(clase))
                .forEach((x, indice) => {
                    let divInputSelected = ParentNode({ elemento: x, level: 2 });
                    let diferenciaEntreUnoyOtroInputSeleccionado = 0;

                    if (ovariables.direccionInputSeleccionado === 'fila') {
                        if (indice === 0) {
                            indiceInicialCoordenada = divInputSelected.getAttribute('data-nrocolumna');
                        }
                        diferenciaEntreUnoyOtroInputSeleccionado = Math.abs(parseInt(indiceInicialCoordenada) - parseInt(divInputSelected.getAttribute('data-nrocolumna')));
                        arrFilasColumnas.push(diferenciaEntreUnoyOtroInputSeleccionado);
                    } else if (ovariables.direccionInputSeleccionado === 'columna') {
                        if (indice === 0) {
                            indiceInicialCoordenada = divInputSelected.getAttribute('data-nrofila');
                        }
                        diferenciaEntreUnoyOtroInputSeleccionado = Math.abs(parseInt(indiceInicialCoordenada) - parseInt(divInputSelected.getAttribute('data-nrofila')));
                        arrFilasColumnas.push(diferenciaEntreUnoyOtroInputSeleccionado);
                    }
                });
            return arrFilasColumnas;
        }

        function handleDragStart_inputs_delascolumnas(e) {
            e.dataTransfer.effectAllowed = "move";
            let o = e.currentTarget;
            ovariables.objSource_delascolumnas = o;
            let divInput = ParentNode({ elemento: o, level: 2 });
            let divForm = ParentNode({ elemento: o, level: 7 });

            if (!ovariables.bool_ctrl_seleccionado) {
                e.dataTransfer.setData('htmlinput', divInput.innerHTML);
            } else if (ovariables.bool_ctrl_seleccionado) {
                //// ACA ES PARA COPIAR LA SELECCION DE INPUTS MULTIPLES                                
                ovariables.arrNumeracionInputsSeleccionadosFila_o_Columna = GetArraySeleccionMultiple({ elemento: divForm, clase: 'cls_input_selected' });
                e.dataTransfer.setData('textClassDivFormSource', divForm.getAttribute('data-divformgenerado'));
            }
        }

        function handler_divform_elegido_drop() {
            //// ARRASTRE SOBRE EL DIV FINAL Chosen
            ArrayElementos({ id: 'body_columns_3cero', clase: 'cls_divform_elegido_drop' })
                .forEach(x => {
                    x.addEventListener('dragover', handlerDragOver_DivFormElegidoDrop, false);
                    x.addEventListener('drop', handlerDrop_DivFormElegidoDrop, false);
                    x.addEventListener('dragleave', EventDragLeave, false);
                });
        }

        async function handlerDrop_DivFormElegidoDrop(e) {
            //// SE PONE ESTO ovariables.objSource_delascolumnas PARA NO CRUZAR CON EL ARRASTRE DE SELECCION MULTIPLE DE LOS INPUTS
            if (ovariables.bool_ctrl_seleccionado && ovariables.objSource_delascolumnas === null) {
                // :pending
                let html_insert = `<br />
                                    <div class="text-left cls_divform_elegido_drop">
                                    <p>Arrastrar aqui Form</p>
                                    </div>`;

                if (e.stopPropagation) e.stopPropagation();
                if (ovariables.objSource_Form !== null) {
                    ovariables.objSource_Form = null;
                    this.innerHTML = e.dataTransfer.getData("htmlform");
                }

                ArrayElementos({ id: 'body_columns_3cero', clase: 'cls_articulo' })[0].insertAdjacentHTML('beforeend', html_insert);

                await fn_setearindex_form_add();
                await handler_divform_final_add({ id: 'body_columns_3cero', clase: 'cls_div_form' });
                await handler_divform_elegido_drop();
            }
        }


        /*FIN FORM*/
        function handleDragOver(e) {
            if (e.preventDefault) e.preventDefault();
            e.dataTransfer.dropEffect = (!ovariables.boolIconsInputColumnasSeleccionado) ? 'move' : 'none';
            if (!ovariables.boolIconsInputColumnasSeleccionado) this.classList.add('cls_over_div_drop');
        }

        function dropInput({ oColumnaOrigen, padreColumnaOrigen, esControlSelect, esInputColumnSelect, event, direccionSelect, aInpuSelect, fnSetearDefault }) {
            const that = event.currentTarget;
            const esSeleccionMultipleConControl = oColumnaOrigen && esControlSelect;
            const esSelectSingle = oColumnaOrigen && !esControlSelect;
            const esSelectPaletaControles = !esInputColumnSelect && !esSeleccionMultipleConControl && !esControlSelect;

            if (esSelectSingle) {
                that.innerHTML = event.dataTransfer.getData("htmlinput");
                padreColumnaOrigen.innerHTML = divInputDestino.innerHTML;
            } else if (esSelectPaletaControles) {
                let nrolabel = Array.from(document.getElementById("body_columns_3cero").getElementsByClassName("cls_articulo")[0].getElementsByClassName("col-form-label")).length + 1;
                that.innerHTML = event.dataTransfer.getData('iconinputs');
                that.getElementsByClassName("col-form-label")[0].innerText = `Label ${nrolabel}`;
            }
            else if (esSeleccionMultipleConControl) {
                let clsDivFormSource = event.dataTransfer.getData('textClassDivFormSource');
                let divFormSource = ArrayElementos({ id: 'body_columns_3cero', clase: clsDivFormSource })[0];
                let nroFilaDestino = parseInt(that.getAttribute('data-nrofila'));
                let nroColumnaDestino = parseInt(that.getAttribute('data-nrocolumna'));
                let divFormDestino = ParentNode({ elemento: that, level: 5 });
                let arrDivInputsDestino = Array.from(divFormDestino.getElementsByClassName('div_drop'));
                let arrInputsSeleccionados = Array.from(divFormSource.getElementsByClassName('cls_input_selected'));

                arrInputsSeleccionados.forEach((x, indice) => {
                    const divInputSource = x.parentNode.parentNode;
                    const htmlDivInputSource = divInputSource.innerHTML;

                    AsignarDestinoHTML({ divDestino: that, arrDivInputsDestino: arrDivInputsDestino, direccion: direccionSelect, htmlDivInputSource: htmlDivInputSource, aInpuSelect: aInpuSelect, indice: indice, atributoColumna: 'data-nrocolumna', atributoFila: 'data-nrofila', nroColumnaDestino: nroColumnaDestino, nroFilaDestino: nroFilaDestino });
                });
                fnSetearDefault(divFormSource, divFormDestino);
            }
        }

        function AsignarDestinoHTML({ divDestino, arrDivInputsDestino, direccion, htmlDivInputSource, aInpuSelect, indice, atributoColumna, atributoFila, nroColumnaDestino, nroFilaDestino }) {
            if (indice === 0) {
                divDestino.innerHTML = htmlDivInputSource;
            } else {
                const nroDiferencia = parseInt(aInpuSelect[indice]);
                const esFila = (direccion === 'fila');
                const nextCopy = esFila ? (nroColumnaDestino + nroDiferencia) : (nroFilaDestino + nroDiferencia);
                const condicionFilaColumna = esFila ? parseInt(nroFilaDestino) : parseInt(nroColumnaDestino);
                const [firstAttribute, secondAttribute] = esFila ? [atributoColumna, atributoFila] : [atributoFila, atributoColumna];
                const divFind = arrDivInputsDestino.find(div => {
                    return (parseInt(div.getAttribute(firstAttribute)) === nextCopy) && (parseInt(div.getAttribute(secondAttribute)) === condicionFilaColumna);
                });
                if (typeof divFind !== "undefined") {
                    divFind.innerHTML = htmlDivInputSource;
                }
            }
        } // :fin

        function getHtmlDireccion({ direccion, atributo, arrInputsSeleccionados, oDiv }) {
            const oAttrColumna = "";
            const oAttrFila = "";
            if (direccion === 'fila') {
                oAttrColumna = atributColumna
            } else if (direccion === 'columna') {

            }
            arrInputsSeleccionados.forEach((x, indice) => {
                const divInputSource = x.parentNode.parentNode;
                const htmlDivInputSource = divInputSource.innerHTML;
                if (indice === 0) {
                    oDiv.innerHTML = htmlDivInputSource;
                } else {
                    const nroDiferencia = parseInt(aInpuSelect[indice]);
                    const encontrarElSiguienteInput_a_Copiar = nroColumnaDestino + nroDiferencia;
                    let arrDivDestinoEncontrado = arrDivInputsDestino.filter(divDestino => {
                        return (parseInt(divDestino.getAttribute('data-nrocolumna')) === encontrarElSiguienteInput_a_Copiar) && (parseInt(divDestino.getAttribute('data-nrofila')) === parseInt(nroFilaDestino));
                    });
                    if (arrDivDestinoEncontrado.length > 0) { arrDivDestinoEncontrado[0].innerHTML = htmlDivInputSource; }
                }
            });
        }


        // :pending :1
        function handleDrop(e) {
            if (e.stopPropagation) e.stopPropagation();

            const oParameters = {
                oColumnaOrigen: ovariables.bool_ctrl_seleccionado ? ovariables.objSource_delascolumnas : null,
                padreColumnaOrigen: ovariables.bool_ctrl_seleccionado ? ovariables.objSource_delascolumnas.parentNode.parentNode : null,
                esControlSelect: ovariables.bool_ctrl_seleccionado,
                esInputColumnSelect: ovariables.boolIconsInputColumnasSeleccionado,
                event: e,
                direccionSelect: ovariables.direccionInputSeleccionado,
                aInpuSelect: ovariables.arrNumeracionInputsSeleccionadosFila_o_Columna,
                fnSetearDefault: fn_setearDefaultAlFinalizarDragDropSeleccionMultiple
            }

            dropInput(oParameters);

            //// LOS INPUTS ARRASTRADOS EN LAS COLUMNAS
            //// HANDLERS            
            Array.from(ArrayElementos({ id: 'body_columns_3cero', clase: 'cls_articulo' })[0].getElementsByClassName("cls_input_delascolumnas"))
                .forEach(x => {
                    x.addEventListener("dragstart", handleDragStart_inputs_delascolumnas, false);
                    x.addEventListener("dragend", handlerDragEnd_inputs_delascolumnas, false);
                    x.addEventListener("click", fn_click_input_delascolumnas, false);
                });

            Array.from(ArrayElementos({ id: 'body_columns_3cero', clase: 'cls_articulo' })[0].getElementsByClassName('cls_delete_input'))
                .forEach(x => {
                    x.addEventListener('click', fn_handler_delete_input, false);
                });

            ovariables.objSource_delascolumnas = null;

        }



        function fn_setearDefaultAlFinalizarDragDropSeleccionMultiple(divFormSource, divFormDestino) {
            // :pending
            let arrInputSource = Array.from(divFormSource.getElementsByClassName('cls_input_delascolumnas'));
            let arrInputsDestino = Array.from(divFormDestino.getElementsByClassName('cls_input_delascolumnas'));
            let arrDivDooteadosSource = Array.from(divFormSource.getElementsByClassName('cls_div_dotted_dirreccionseleccionada'));
            let arrDivColumnasSource = Array.from(divFormSource.getElementsByClassName('cls_div_columnas_filas'));

            arrInputSource.filter(x => x.classList.value.indexOf('cls_input_selected') >= 0)
                .forEach(x => {
                    let divInputSource = x.parentNode.parentNode;
                    x.classList.remove('cls_input_selected');
                    divInputSource.classList.remove('cls_backcolor_div_control_seleccionado');
                    divInputSource.classList.remove('cls_div_dotted_dirreccionseleccionada');
                });

            arrDivDooteadosSource.forEach(x => {
                x.classList.remove('cls_div_dotted_dirreccionseleccionada');
            });

            arrInputsDestino.filter(x => x.classList.value.indexOf('cls_input_selected') >= 0)
                .forEach(x => {
                    x.classList.remove('cls_input_selected');
                });

            //// ELIMINAR LOS DIV DEL BOTON ELIMINAR
            arrDivColumnasSource.forEach(x => {
                Array.from(x.getElementsByClassName('cls_div_deleteinput_selected'))
                    .forEach(y => {
                        x.removeChild(y);
                    });
            });

            ovariables.contadorInputSeleccionado = 0;
            ovariables.coordenadaInicialSeleccionadaJson.fila = 0;
            ovariables.coordenadaInicialSeleccionadaJson.columna = 0;
            ovariables.direccionInputSeleccionado = '';
            ovariables.arrNumeracionInputsSeleccionadosFila_o_Columna = [];
        }

        function handlerDragEnd_inputs_delascolumnas(e) {
            ovariables.objSource_delascolumnas = null;
            Array.from(doc.getElementById('body_columns_3cero').getElementsByClassName('cls_over_div_drop'))
                .forEach(x => {
                    x.classList.remove('cls_over_div_drop');
                });
        }



        function fn_setear_despues_add_columnas_filas(cls_div_generado) {
            let arr_columnas_filas = Array.from(doc.getElementById('body_columns_3cero').getElementsByClassName(cls_div_generado)[0].getElementsByClassName('cls_div_columnas_filas'));
            let btn_add_fila = doc.getElementById('body_columns_3cero').getElementsByClassName(cls_div_generado)[0].getElementsByClassName('cls_add_fila')[0];
            if (arr_columnas_filas.length > 0) {
                btn_add_fila.classList.remove('d-none');
            }
            ovariables.boolIconsInputColumnasSeleccionado = false;
        }

        function fn_get_html_seguninputtype(type_input) {
            let html = "";
            if (type_input === 'text') {
                html = `
                    <label class="col-form-label col-sm-3" contenteditable="true">Label</label>
                    <div class="col-sm-9">
                        <div class='text-right d-none cls_eliminar cls_submenu_input' style='font-size: 12px !important;'>
                            <span class='fa fa-trash cls_delete_input'></span>
                        </div>
                        <input type="text" class="form-control cls_input_delascolumnas" placeholder="" draggable="true" />
                    </div>
                `;
            }
            return html;
        }

        function handler_divdrop(cls_divform_generado) {
            Array.from(doc.getElementById("body_columns_3cero").getElementsByClassName(cls_divform_generado)[0].getElementsByClassName("div_drop"))
                .forEach(x => {
                    x.addEventListener("dragover", handleDragOver, false);
                    x.addEventListener("drop", handleDrop, false);
                    x.addEventListener("dragleave", EventDragLeave, false);
                });

            let btn_add_fila = doc.getElementById("body_columns_3cero").getElementsByClassName(cls_divform_generado)[0].getElementsByClassName('cls_btn_add_fila')[0];
            btn_add_fila.addEventListener('click', fn_add_fila_paracolumnas, false);
        }

        doc.getElementById("txtnrocolumas").addEventListener("change", fn_change_setcolumnas, false);
        doc.getElementById("txtnrofilas").addEventListener("change", fn_change_setfilas, false);
        doc.getElementById("txtnrofilas").addEventListener("blur", fn_onblur_setfilas, false);

        function fn_change_setcolumnas(e) {
            let nrocolumnas = e.currentTarget.value;
            doc.getElementById("spn_columna").setAttribute("data-nrocolumnas", nrocolumnas);
        }
        function fn_change_setfilas(e) {
            let nrofilas = e.currentTarget.value;
            doc.getElementById("spn_columna").setAttribute("data-nrofilas", nrofilas);
        }

        function fn_onblur_setfilas(e) {
            doc.getElementById('div_section_columnasfilas').classList.add('d-none');
        }

        //// VER SI LO QUITO ESTO
        function fn_visualizar_section_columnasfilas() {
            let div = doc.getElementById("div_section_columnasfilas");
            let clase = div.classList.value;
            if (clase === 'd-none') {
                div.classList.remove("d-none");
            } else if (clase === '') {
                div.classList.add("d-none");
            }
        }

        // :pending :2
        function fn_click_input_delascolumnas(e) {
            let o = e.currentTarget;
            let divInput = o.parentNode;
            let divPadreContenedorInput = o.parentNode.parentNode;
            let tipoinput = o.type;
            if (!ovariables.bool_ctrl_seleccionado) {
                fn_solo_click_input_delascolumnas(divInput);
            } else {
                //// ACA VA CON CTRL SELECCIONADO PARA HACER MULTISELECCION
                let divform = o.parentNode.parentNode.parentNode.parentNode;
                let coordenada_fila = divPadreContenedorInput.getAttribute('data-nrofila');
                let coordenada_columna = divPadreContenedorInput.getAttribute('data-nrocolumna');
                o.classList.toggle("cls_input_selected");
                if (o.classList.value.indexOf('cls_input_selected') >= 0) {
                    //// SI TIENE LA CLASE DE SELECCIONADO
                    ovariables.contadorInputSeleccionado++;
                } else {
                    //// SI NO TIENE LA CLASE DE SELECCIONADO
                    ovariables.contadorInputSeleccionado--;
                }
                //// SABER CUANTOS SE HA SELECCIONADO
                if (ovariables.contadorInputSeleccionado === 1) {
                    //// ESTABLECER LA COORDENADA INICIAL
                    let inputSelectedTemporal = divform.getElementsByClassName('cls_input_selected')[0];
                    let divInputTemporal = inputSelectedTemporal.parentNode.parentNode;
                    ovariables.coordenadaInicialSeleccionadaJson.fila = divInputTemporal.getAttribute('data-nrofila'); //coordenada_fila;
                    ovariables.coordenadaInicialSeleccionadaJson.columna = divInputTemporal.getAttribute('data-nrocolumna'); //coordenada_columna;
                    ovariables.direccionInputSeleccionado = '';
                    fn_set_color_input_seleccionado_control(o);
                    fn_marcarDireccionSeleccionPermitida(divform);
                } else if (ovariables.contadorInputSeleccionado > 1) {
                    if (coordenada_fila === ovariables.coordenadaInicialSeleccionadaJson.fila) {
                        //// MISMA FILA
                        if (ovariables.contadorInputSeleccionado === 2) {
                            ovariables.direccionInputSeleccionado = 'fila';
                            fn_set_color_input_seleccionado_control(o);
                            //// MARCAR LA FILA DONDE ESTA PERMITIDO SELECCIONAR
                            fn_marcarDireccionSeleccionPermitida(divform);
                        } else {
                            if (ovariables.direccionInputSeleccionado === 'fila') {
                                fn_set_color_input_seleccionado_control(o);
                            } else {
                                //// FALTO QUITAR LA CLASE DE SELECCIONADO AL INPUT
                                o.classList.remove('cls_input_selected');
                                //// ACA RESTO POR QUE ARRIBA LO ESTOY SUMANDO
                                ovariables.contadorInputSeleccionado--;                                
                            }
                        }

                    } else if (coordenada_fila !== ovariables.coordenadaInicialSeleccionadaJson.fila && coordenada_columna === ovariables.coordenadaInicialSeleccionadaJson.columna) {
                        //// MISMA COLUMNA
                        if (ovariables.contadorInputSeleccionado === 2) {
                            ovariables.direccionInputSeleccionado = 'columna';
                            fn_set_color_input_seleccionado_control(o);
                            //// MARCAR LA COLUMNA DONDE ESTA PERMITIDO SELECCIONAR
                            fn_marcarDireccionSeleccionPermitida(divform);
                        } else {
                            if (ovariables.direccionInputSeleccionado === 'columna') {
                                fn_set_color_input_seleccionado_control(o);
                            } else {
                                //// FALTO QUITAR LA CLASE DE SELECCIONADO AL INPUT
                                o.classList.remove('cls_input_selected');
                                //// ACA RESTO POR QUE ARRIBA LO ESTOY SUMANDO
                                ovariables.contadorInputSeleccionado--;                                
                            }
                        }

                    } else {
                        //// FALTO QUITAR LA CLASE DE SELECCIONADO AL INPUT
                        o.classList.remove('cls_input_selected');
                        //// ACA RESTO POR QUE ARRIBA LO ESTOY SUMANDO
                        ovariables.contadorInputSeleccionado--;
                        //// ES DIFERENTE FILA Y DIFERENTE COLUMNA
                        
                    }
                } else if (ovariables.contadorInputSeleccionado === 0) {
                    //// ESTABLECER LA COORDENADA INICIAL
                    ovariables.coordenadaInicialSeleccionadaJson.fila = 0;
                    ovariables.coordenadaInicialSeleccionadaJson.columna = 0;
                    fn_set_color_input_seleccionado_control(o);
                }
            }
        }

        function fn_marcarDireccionSeleccionPermitida(divForm) {
            let arrDivInput = Array.from(divForm.getElementsByClassName('div_drop'));
            if (ovariables.direccionInputSeleccionado === 'fila') {
                arrDivInput.filter(x => parseInt(x.getAttribute('data-nrofila')) === parseInt(ovariables.coordenadaInicialSeleccionadaJson.fila))
                    .forEach(x => {
                        x.classList.add('cls_div_dotted_dirreccionseleccionada');
                    });
            } else if (ovariables.direccionInputSeleccionado === 'columna') {
                arrDivInput.filter(x => parseInt(x.getAttribute('data-nrocolumna')) === parseInt(ovariables.coordenadaInicialSeleccionadaJson.columna))
                    .forEach(x => {
                        x.classList.add('cls_div_dotted_dirreccionseleccionada');
                    });
            } else {
                //// SI NO HAY DIRECCION
                arrDivInput.forEach(x => {
                    x.classList.remove('cls_div_dotted_dirreccionseleccionada');
                });
            }

            //// ACA QUITAR LOS BOTONES ELIMINAR DEL MISMO INPUT
            Array.from(divForm.getElementsByClassName('cls_submenu_input'))
                .forEach(x => {
                    x.classList.add('d-none');
                });

            //// ACA AGREGAR EL BOTON ELIMINAR LA SELECCION
            let arrInputSeleccionados = Array.from(divForm.getElementsByClassName('cls_input_selected'));
            if (arrInputSeleccionados.length >= 2) {
                let existeDivDelete = Array.from(divForm.getElementsByClassName('cls_div_deleteinput_selected'));
                if (existeDivDelete.length <= 0) {
                    Array.from(divForm.getElementsByClassName('cls_div_dotted_dirreccionseleccionada'))
                        .forEach((x, indice) => {
                            if (indice === 0) {
                                // :pending
                                html = `<div class='cls_div_deleteinput_selected'>
                                            <span class="fa fa-trash text-danger cls_spn_deleteinput_multiseleccion" title='Eliminar inputs seleccionados' style='cursor: pointer;'></span>
                                        </div>`;
                                x.insertAdjacentHTML('beforebegin', html);
                            } else {
                                html = `<div class='cls_div_deleteinput_selected invisible'>
                                            <span class="fa fa-trash"></span>
                                        </div>`;
                                x.insertAdjacentHTML('beforebegin', html);
                            }
                        });
                    handlerDeleteInputMultiseleccion(divForm);
                }
            } else {
                //// SI ES MENOR A 2
                // :pending
                Array.from(divForm.getElementsByClassName('cls_div_columnas_filas'))
                    .forEach(x => {
                        Array.from(x.getElementsByClassName('cls_div_deleteinput_selected'))
                            .forEach(y => {
                                x.removeChild(y);
                            });
                    });
            }
        }

        // :pending
        function handlerDeleteInputMultiseleccion(divForm) {
            divForm.getElementsByClassName('cls_spn_deleteinput_multiseleccion')[0].addEventListener('click', function (e) { let o = e.currentTarget; fn_deleteinput_multiseleccion(o, divForm); }, false);
        }

        // :pending
        function fn_deleteinput_multiseleccion(o, divForm) {
            Array.from(divForm.getElementsByClassName('cls_input_selected'))
                .forEach(x => {
                    let div_form_group = x.parentNode.parentNode;
                    Array.from(div_form_group.children)
                        .forEach(y => {
                            div_form_group.removeChild(y);

                        });
                    div_form_group.innerHTML = '<p>Arrastrar aqui</p>';

                });

            Array.from(divForm.getElementsByClassName('cls_div_dotted_dirreccionseleccionada'))
                .forEach(x => {
                    x.classList.remove('cls_backcolor_div_control_seleccionado');
                    x.classList.remove('cls_div_dotted_dirreccionseleccionada');
                });

            Array.from(divForm.getElementsByClassName('cls_div_deleteinput_selected'))
                .forEach(x => {
                    let divColumna = x.parentNode;
                    divColumna.removeChild(x);
                });

            // :pending
            ovariables.coordenadaInicialSeleccionadaJson.fila = 0;
            ovariables.coordenadaInicialSeleccionadaJson.columna = 0;
            ovariables.contadorInputSeleccionado = 0;
            ovariables.direccionInputSeleccionado = ''; //// PARA INDICAR QUE LA DIRECCION SERA POR FILA O POR COLUMNA
            ovariables.arrNumeracionInputsSeleccionadosFila_o_Columna = [];
        }

        // :pending
        function fn_set_color_input_seleccionado_control(o) {
            let div_parent = o.parentNode.parentNode;
            if (o.classList.value.indexOf("cls_input_selected") >= 0) {
                div_parent.classList.add("cls_backcolor_div_control_seleccionado");
            } else {
                div_parent.classList.remove("cls_backcolor_div_control_seleccionado");
            }
        }

        // :pending
        function fn_solo_click_input_delascolumnas(divInput) {
            let divForm = divInput.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            
            let div_submenu = divInput.getElementsByClassName('cls_submenu_input')[0];
            let estado_inicial_submenu = div_submenu.classList.value.indexOf('d-none') < 0 ? true : false;

            
            Array.from(divForm.getElementsByClassName('cls_submenu_input'))
                .forEach(x => {
                    x.classList.add('d-none');
                });

            let esta_visible_submenu = div_submenu.classList.value.indexOf('d-none');

            if (esta_visible_submenu < 0) {
                
                div_submenu.classList.add('d-none');
            } else {
                
                if (estado_inicial_submenu) {
                    div_submenu.classList.add('d-none');
                } else {
                    div_submenu.classList.remove('d-none');
                }
            }
        }

        // :pending
        function fn_handler_delete_input(e) {
            let o = e.currentTarget;
            let div_form_group = o.parentNode.parentNode.parentNode;
            Array.from(div_form_group.children)
                .forEach(x => {
                    div_form_group.removeChild(x);

                });
            div_form_group.innerHTML = '<p>Arrastrar aqui</p>';
        }

        // :pending
        function fn_add_fila_paracolumnas(e) {
            let o = e.currentTarget;
            let contenedor = o.parentNode.parentNode;
            let html = '';
            Array.from(contenedor.getElementsByClassName('col'))
                .forEach((x, indice) => {
                    let totalFilas = x.getElementsByClassName('div_drop').length;
                    let nroColumna = indice + 1;
                    let nroFila = totalFilas + 1;
                    html = `
                        <div class="form-group row div_drop" data-nrofila='${nroFila}' data-nrocolumna='${nroColumna}'>
                            <p>Arrastrar aqui</p>
                        </div>`;
                    x.insertAdjacentHTML('beforeend', html);
                    let div_input_column = x.lastElementChild;
                    div_input_column.addEventListener("dragover", handleDragOver, false);
                    div_input_column.addEventListener("drop", handleDrop, false);
                    div_input_column.addEventListener("dragleave", EventDragLeave, false);
                });
        }

        //// HANDLER PARA EL FORM
        function fn_keydown_articulo(e) {
            if (e.keyCode === 17) {
                ovariables.bool_ctrl_seleccionado = true;
            }
        }

        function fn_keyup_articulo() {
            ovariables.bool_ctrl_seleccionado = false;
        }

        //// HANDLER PARA EL FORM        
        function fn_setearindex_form_add() {
            console.log('fn_setearindex_form_add => 1')

            let arrform = ArrayElementos({ id: 'body_columns_3cero', clase: 'cls_div_form' });
            let ultimoindice = arrform.length - 1;
            let divform = arrform[ultimoindice];
            let data_nombreform = divform.getAttribute('data-divformgenerado');
            let classindexgenerado = 'cls_div_form_' + ultimoindice;

            divform.classList.remove(data_nombreform);
            divform.setAttribute('data-divformgenerado', classindexgenerado);
            divform.classList.add(classindexgenerado);
        }

        function handler_divform_final_add({ id, clase }) {
            console.log('handler_divform_final_add => 3')

            //// FORM
            let elementos = ArrayElementos({ id: id, clase: clase });
            let ultimodiv = elementos.length - 1;

            let divform = elementos[ultimodiv];

            setEvents({
                elements: [divform],
                events: [{ event: "dragstart", func: handlerDragStarForm }, { event: "dragend", func: handlerDragEndForm }]
            });

            //// LOS INPUTS ARRASTRADOS EN LAS COLUMNAS
            setEvents({
                elements: Array.from(divform.getElementsByClassName("cls_input_delascolumnas")),
                events: [{ event: "dragstart", func: handleDragStart_inputs_delascolumnas }, { event: "dragend", func: handlerDragEnd_inputs_delascolumnas }, { event: "click", func: fn_click_input_delascolumnas }]
            });

            setEvents({
                elements: Array.from(divform.getElementsByClassName('cls_delete_input')),
                events: [{ event: "click", func: fn_handler_delete_input }]
            });

            setEvents({
                elements: [divform.getElementsByClassName('cls_row_where_drop')[0]],
                events: [{ event: "dragover", func: handlerDragOverColumnas }, { event: "drop", func: handleDropColumnas }, { event: "dragleave", func: EventDragLeave }]
            });

            //// PARA LOS DIVS DE COLUMNAS YA ARRASTRADAS            
            setEvents({
                elements: Array.from(divform.getElementsByClassName("div_drop")),
                events: [{ event: "dragover", func: handleDragOver }, { event: "drop", func: handleDrop }, { event: "dragleave", func: EventDragLeave }]
            })

            setEvents({
                elements: [divform.getElementsByClassName('cls_btn_add_fila')[0]],
                events: [{ event: "click", func: fn_add_fila_paracolumnas }]
            });
        }

        return {
            load: load

        };
    }
)(document, 'body_columns_3cero');

(
    function init() {
        appPrototipar.load();
    }
)();