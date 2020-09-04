var appPrototipar = (
    function (d, padre) {
        var ovariables = {
            bool_ctrl_seleccionado: false,
            objSource_Form: null,
            objSource_delascolumnas: null,
            coordenadaInicialSeleccionadaJson: { fila: 0, columna: 0 },
            contadorInputSeleccionado: 0,
            direccionInputSeleccionado: '', //// PARA INDICAR QUE LA DIRECCION SERA POR FILA O POR COLUMNA
            arrNumeracionInputsSeleccionadosFila_o_Columna: [],
            boolIconsInputColumnasSeleccionado: false
        }

        function load() {
            Array.from(document.getElementById("columna_columns").getElementsByClassName("cls_input_drag"))
                .forEach(x => {
                    x.addEventListener("dragstart", handleDragStart, false);
                    x.addEventListener("dragend", handlerDragEndIconsInput, false);
                });

            document.getElementById("div_row_where_drop").addEventListener("dragover", handlerDragOverColumnas, false);
            document.getElementById("div_row_where_drop").addEventListener("drop", handleDropColumnas, false);
            document.getElementById("div_row_where_drop").addEventListener("dragleave", handlerDragLeaveColumnas, false);

            document.getElementById("spn_columna").addEventListener("click", fn_visualizar_section_columnasfilas, false);

            //// PARA EVENTOS DEL ARTICULO - FORM
            //// ARRASTRE SOBRE EL DIV INICIAL ELEGIDO
            document.getElementById('body_columns_3cero').addEventListener('keydown', fn_keydown_articulo, false);
            document.getElementById('body_columns_3cero').addEventListener('keyup', fn_keyup_articulo, false);
            Array.from(document.getElementById('body_columns_3cero').getElementsByClassName('cls_div_form'))
                .forEach(x => {
                    x.addEventListener('dragstart', handlerDragStarForm, false);
                    x.addEventListener('dragend', handlerDragEndForm, false);
                });
            //// ARRASTRE SOBRE EL DIV FINAL ELEGIDO
            //// REEMPLAZAR POR FUNCION
            handler_divform_elegido_drop();
        }

        /*EMPIEZA EL ARRASTRE DE FILAS Y COLUMNAS*/
        function handleDragStart(e) {
            e.dataTransfer.effectAllowed = 'move';
            let o = e.currentTarget;
            let tiene_clase_configuracolumna = o.classList.value.indexOf("cls_configura_columnas");
            let nrocolumnas = o.getAttribute("data-nrocolumnas");
            let nrofilas = o.getAttribute("data-nrofilas");
            let inputtype = o.getAttribute("data-inputtype");
            let html = "";

            if (tiene_clase_configuracolumna >= 0) {
                let fn_htmlfilas = function (nrofilas, nrocolumna) {
                    let subhtml = '';
                    for (var y = 1; y <= nrofilas; y++) {
                        subhtml += `
                        <div class="form-group row div_drop" data-nrofila='${y}' data-nrocolumna='${nrocolumna}'>
                            <p>Arrastrar aqui</p>
                        </div>`;
                    };

                    return subhtml;
                }

                for (var i = 1; i <= nrocolumnas; i++) {
                    html += `
                        <div class="col cls_div_columnas_filas">
                            ${ fn_htmlfilas(nrofilas, i)}
                        </div>
                     `;

                }

                ovariables.boolIconsInputColumnasSeleccionado = true;
            } else {

                html = fn_get_html_seguninputtype(inputtype);
            }

            e.dataTransfer.setData('iconinputs', html);
        }
        function handlerDragEndIconsInput(e) {
            Array.from(document.getElementById('body_columns_3cero').getElementsByClassName('cls_over_div_drop'))
                .forEach(x => {
                    x.classList.remove('cls_over_div_drop');
                });
            ovariables.boolIconsInputColumnasSeleccionado = false;
        }

        /* AL SOLTAR LAS FILAS Y COLUMNAS*/
        function handlerDragOverColumnas(e) {
            if (e.preventDefault) {
                e.preventDefault(); // Necessary. Allows us to drop.
            }

            //// NOTA: DROPEFFECT; INVALIDA EL OBJETO DONDE SE VA A SOLTAR; NO PERMITE SOLTAR LO ARRASTRADO
            //e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
            if (ovariables.boolIconsInputColumnasSeleccionado === true) {
                this.classList.add('cls_over_div_drop');
                //// NO FUNCIONA ESTO ACA
                //e.dataTransfer.effectAllowed = 'move';
            }

            return false;
        }
        function handleDropColumnas(e) {
            if (e.stopPropagation) {
                e.stopPropagation(); // Stops some browsers from redirecting.
            }

            if (ovariables.objSource_delascolumnas === null && ovariables.boolIconsInputColumnasSeleccionado === true) {
                let div_form = this.parentNode.parentNode.parentNode;
                this.innerHTML = e.dataTransfer.getData("iconinputs");
                let cls_div_form_generado = div_form.getAttribute('data-divformgenerado');
                handler_divdrop(cls_div_form_generado);
                fn_setear_despues_add_columnas_filas(cls_div_form_generado);
            }
        }
        function handlerDragLeaveColumnas(e) {
            this.classList.remove('cls_over_div_drop');
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

        //// DIV ELEGIDO ORIGEN
        function handlerDragEndForm(e) {
            ovariables.objSource_Form = null;
            //// AL FINALIZAR EL ARRASTRE DEL DIV FOR QUITAR LA CLASE 
            Array.from(document.getElementById('body_columns_3cero').getElementsByClassName('cls_divform_elegido_drop'))
                .forEach(x => {
                    x.classList.remove('cls_over_div_drop');
                });
        }

        function handlerDragOver_DivFormElegidoDrop(e) {
            if (e.preventDefault) {
                e.preventDefault();
            }
            e.dataTransfer.dropEffect = 'move';
            //// PARA BORDE DEL DIV CUANDO SE SOBREPONE EL MOUSE EN EL DIV DONDE SE SOLTARÁ
            if (ovariables.objSource_Form) {
                this.classList.add('cls_over_div_drop');
            }

            return false;
        }

        function handleDragStart_inputs_delascolumnas(e) {
            e.dataTransfer.effectAllowed = "move";
            let o = e.currentTarget;
            ovariables.objSource_delascolumnas = o;
            let divInput = o.parentNode.parentNode; //// DIV CONTENEDOR DEL INPUT
            let divForm = o.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

            if (ovariables.bool_ctrl_seleccionado === false) {
                let html = divInput.innerHTML;
                e.dataTransfer.setData('htmlinput', html);
            } else if (ovariables.bool_ctrl_seleccionado) {
                //// ACA ES PARA COPIAR LA SELECCION DE INPUTS MULTIPLES
                //// CREAR EL ARRAY DE SELECCION MULTIPLE
                let indiceInicialCoordenada = 0;
                Array.from(divForm.getElementsByClassName('cls_input_selected'))
                    .forEach((x, indice) => {
                        let divInputSelected = x.parentNode.parentNode;
                        let diferenciaEntreUnoyOtroInputSeleccionado = 0;
                        if (ovariables.direccionInputSeleccionado === 'fila') {
                            if (indice === 0) {
                                indiceInicialCoordenada = divInputSelected.getAttribute('data-nrocolumna');
                            }
                            diferenciaEntreUnoyOtroInputSeleccionado = Math.abs(parseInt(indiceInicialCoordenada) - parseInt(divInputSelected.getAttribute('data-nrocolumna')));
                            ovariables.arrNumeracionInputsSeleccionadosFila_o_Columna.push(diferenciaEntreUnoyOtroInputSeleccionado);
                        } else if (ovariables.direccionInputSeleccionado === 'columna') {
                            if (indice === 0) {
                                indiceInicialCoordenada = divInputSelected.getAttribute('data-nrofila');
                            }
                            diferenciaEntreUnoyOtroInputSeleccionado = Math.abs(parseInt(indiceInicialCoordenada) - parseInt(divInputSelected.getAttribute('data-nrofila')));
                            ovariables.arrNumeracionInputsSeleccionadosFila_o_Columna.push(diferenciaEntreUnoyOtroInputSeleccionado);
                        }
                    });
                let clsDivFormSource = divForm.getAttribute('data-divformgenerado');
                e.dataTransfer.setData('textClassDivFormSource', clsDivFormSource);
            }
        }
        function handler_divform_elegido_drop() {
            //// ARRASTRE SOBRE EL DIV FINAL ELEGIDO
            Array.from(document.getElementById('body_columns_3cero').getElementsByClassName('cls_divform_elegido_drop'))
                .forEach(x => {
                    x.addEventListener('dragover', handlerDragOver_DivFormElegidoDrop, false);
                    x.addEventListener('drop', handlerDrop_DivFormElegidoDrop, false);
                    x.addEventListener('dragleave', handlerDragLeaveDivFormElegido, false);
                    //// SE DESENCADENA CUANDO SE ELIGIÓ AL DIV DONDE SE VA A SOLTAR ---- SE QUITA ESTE EVENTO Y LO PUSE EN EL DRAGOVER
                    //x.addEventListener('dragenter', handlerDragEnterDivFormElegido, false);
                    //// SE DESENCADENA CUANDO SE SALE DEL DIV DONDE SE VA A SOLTAR
                });
        }

        function handlerDrop_DivFormElegidoDrop(e) {
            //// SE PONE ESTO ovariables.objSource_delascolumnas PARA NO CRUZAR CON EL ARRASTRE DE SELECCION MULTIPLE DE LOS INPUTS
            if (ovariables.bool_ctrl_seleccionado && ovariables.objSource_delascolumnas === null) {
                let html_insert = `
                <br />
                <div class="text-left cls_divform_elegido_drop">
                    <p>Arrastrar aqui Form</p>
                </div>
                `;

                if (e.stopPropagation) {
                    e.stopPropagation();
                }

                if (ovariables.objSource_Form !== null) {
                    this.innerHTML = e.dataTransfer.getData("htmlform");
                }

                document.getElementById('body_columns_3cero').getElementsByClassName('cls_articulo')[0].insertAdjacentHTML('beforeend', html_insert);

                ovariables.objSource_Form = null;

                handler_divform_final_add();
            }

            return false;
        }

        function handlerDragLeaveDivFormElegido(e) {
            this.classList.remove('cls_over_div_drop');
        }
        /*FIN FORM*/
         

        function handleDragOver(e) {
            if (e.preventDefault) {
                e.preventDefault(); // Necessary. Allows us to drop.
            }

            //e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
            if (ovariables.boolIconsInputColumnasSeleccionado === false) {
                e.dataTransfer.dropEffect = 'move';
                this.classList.add('cls_over_div_drop');
            } else {
                e.dataTransfer.dropEffect = 'none';
            }

            return false;
        }

        function handlerDragLeave(e) {
            this.classList.remove('cls_over_div_drop');
            return false;
        }

        function handleDrop(e) {
            if (e.stopPropagation) {
                e.stopPropagation(); // Stops some browsers from redirecting.
            }

            let divInputDestino = e.currentTarget;
            if (ovariables.objSource_delascolumnas && ovariables.bool_ctrl_seleccionado === false) {
                let html_para_copiar = divInputDestino.innerHTML;

                this.innerHTML = e.dataTransfer.getData("htmlinput");
                let padre_source = ovariables.objSource_delascolumnas.parentNode.parentNode;
                padre_source.innerHTML = html_para_copiar;
            }
            else if (ovariables.objSource_delascolumnas && ovariables.bool_ctrl_seleccionado === true) {
                //// ENTRA ACA CUANDO ES SELECCION MULTIPLE PRESIONANDO EL TECLADO CTRL
                let clsDivFormSource = e.dataTransfer.getData('textClassDivFormSource');
                let divFormSource = document.getElementById('body_columns_3cero').getElementsByClassName(clsDivFormSource)[0];
                let arrInputsSeleccionados = Array.from(divFormSource.getElementsByClassName('cls_input_selected'));
                let nroFilaDestino = divInputDestino.getAttribute('data-nrofila');
                let nroColumnaDestino = divInputDestino.getAttribute('data-nrocolumna');
                let divFormDestino = divInputDestino.parentNode.parentNode.parentNode.parentNode.parentNode;
                let arrDivInputsDestino = Array.from(divFormDestino.getElementsByClassName('div_drop'));
                if (ovariables.direccionInputSeleccionado === 'fila') {
                    arrInputsSeleccionados.forEach((x, indice) => {
                        let divInputSource = x.parentNode.parentNode;
                        let htmlDivInputSource = divInputSource.innerHTML;
                        if (indice === 0) {
                            this.innerHTML = htmlDivInputSource;
                        } else {
                            let nroDiferencia = ovariables.arrNumeracionInputsSeleccionadosFila_o_Columna[indice];
                            let encontrarElSiguienteInput_a_Copiar = parseInt(nroColumnaDestino) + parseInt(nroDiferencia);
                            let arrDivDestinoEncontrado = arrDivInputsDestino.filter(y => {
                                return (parseInt(y.getAttribute('data-nrocolumna')) === parseInt(encontrarElSiguienteInput_a_Copiar)) && (parseInt(y.getAttribute('data-nrofila')) === parseInt(nroFilaDestino))
                            });

                            if (arrDivDestinoEncontrado.length > 0) {
                                arrDivDestinoEncontrado[0].innerHTML = htmlDivInputSource;
                            }
                        }
                    });
                } else if (ovariables.direccionInputSeleccionado === 'columna') {
                    arrInputsSeleccionados.forEach((x, indice) => {
                        let divInputSource = x.parentNode.parentNode;
                        let htmlDivInputSource = divInputSource.innerHTML;
                        if (indice === 0) {
                            this.innerHTML = htmlDivInputSource;
                        } else {
                            let nroDiferencia = ovariables.arrNumeracionInputsSeleccionadosFila_o_Columna[indice];
                            let encontrarElSiguienteInput_a_Copiar = parseInt(nroFilaDestino) + parseInt(nroDiferencia);
                            let arrDivDestinoEncontrado = arrDivInputsDestino.filter(y => {
                                return (parseInt(y.getAttribute('data-nrofila')) === parseInt(encontrarElSiguienteInput_a_Copiar)) && (parseInt(y.getAttribute('data-nrocolumna')) === parseInt(nroColumnaDestino))
                            });

                            if (arrDivDestinoEncontrado.length > 0) {
                                arrDivDestinoEncontrado[0].innerHTML = htmlDivInputSource;
                            }
                        }
                    });
                }
                fn_setearDefaultAlFinalizarDragDropSeleccionMultiple(divFormSource, divFormDestino);
            }
            else if (ovariables.boolIconsInputColumnasSeleccionado === false) {
                //// ENTRA ACA CUANDO ES DE LA PALETA DE INPUTS; PERO SOLO LOS INPUTS COMO INPUT TEXT, COMBO
                //// MAS NO LA CONFIGURACION DE COLUMNAS Y FILAS
                let nrolabel = Array.from(document.getElementById("body_columns_3cero").getElementsByClassName("cls_articulo")[0].getElementsByClassName("col-form-label")).length + 1;

                this.innerHTML = e.dataTransfer.getData('iconinputs');
                this.getElementsByClassName("col-form-label")[0].innerText = `Label ${nrolabel}`;  //// ${nrolabel}
            }

            //// LOS INPUTS ARRASTRADOS EN LAS COLUMNAS
            //// HANDLERS
            Array.from(document.getElementById("body_columns_3cero").getElementsByClassName("cls_articulo")[0].getElementsByClassName("cls_input_delascolumnas"))
                .forEach(x => {
                    x.addEventListener("dragstart", handleDragStart_inputs_delascolumnas, false);
                    x.addEventListener("dragend", handlerDragEnd_inputs_delascolumnas, false);
                    x.addEventListener("click", fn_click_input_delascolumnas, false);
                });

            Array.from(document.getElementById("body_columns_3cero").getElementsByClassName("cls_articulo")[0].getElementsByClassName('cls_delete_input'))
                .forEach(x => {
                    x.addEventListener('click', fn_handler_delete_input, false);
                });

            ovariables.objSource_delascolumnas = null;

            return false;
        }

        function fn_setearDefaultAlFinalizarDragDropSeleccionMultiple(divFormSource, divFormDestino) {
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
            Array.from(document.getElementById('body_columns_3cero').getElementsByClassName('cls_over_div_drop'))
                .forEach(x => {
                    x.classList.remove('cls_over_div_drop');
                });
        }

        

        function fn_setear_despues_add_columnas_filas(cls_div_generado) {
            let arr_columnas_filas = Array.from(document.getElementById('body_columns_3cero').getElementsByClassName(cls_div_generado)[0].getElementsByClassName('cls_div_columnas_filas'));
            let btn_add_fila = document.getElementById('body_columns_3cero').getElementsByClassName(cls_div_generado)[0].getElementsByClassName('cls_add_fila')[0];
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
            Array.from(document.getElementById("body_columns_3cero").getElementsByClassName(cls_divform_generado)[0].getElementsByClassName("div_drop"))
                .forEach(x => {
                    x.addEventListener("dragover", handleDragOver, false);
                    x.addEventListener("drop", handleDrop, false);
                    x.addEventListener("dragleave", handlerDragLeave, false);
                });

            let btn_add_fila = document.getElementById("body_columns_3cero").getElementsByClassName(cls_divform_generado)[0].getElementsByClassName('cls_btn_add_fila')[0];
            btn_add_fila.addEventListener('click', fn_add_fila_paracolumnas, false);
        }

        document.getElementById("txtnrocolumas").addEventListener("change", fn_change_setcolumnas, false);
        document.getElementById("txtnrofilas").addEventListener("change", fn_change_setfilas, false);
        document.getElementById("txtnrofilas").addEventListener("blur", fn_onblur_setfilas, false);

        function fn_change_setcolumnas(e) {
            let nrocolumnas = e.currentTarget.value;
            document.getElementById("spn_columna").setAttribute("data-nrocolumnas", nrocolumnas);
        }
        function fn_change_setfilas(e) {
            let nrofilas = e.currentTarget.value;
            document.getElementById("spn_columna").setAttribute("data-nrofilas", nrofilas);

        }

        function fn_onblur_setfilas(e) {
            document.getElementById('div_section_columnasfilas').classList.add('d-none');
        }

        //// VER SI LO QUITO ESTO
        function fn_visualizar_section_columnasfilas() {
            let div = document.getElementById("div_section_columnasfilas");
            let clase = div.classList.value;
            if (clase === 'd-none') {
                div.classList.remove("d-none");
            } else if (clase === '') {
                div.classList.add("d-none");
            }
        }

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
                                alert('La direccion es solo por columna...!');
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
                                alert('La direccion es solo por fila...!');
                            }
                        }

                    } else {
                        //// FALTO QUITAR LA CLASE DE SELECCIONADO AL INPUT
                        o.classList.remove('cls_input_selected');
                        //// ACA RESTO POR QUE ARRIBA LO ESTOY SUMANDO
                        ovariables.contadorInputSeleccionado--;
                        //// ES DIFERENTE FILA Y DIFERENTE COLUMNA
                        alert(`La direccion es solo por ${ovariables.direccionInputSeleccionado}...!`);
                    }
                } else if (ovariables.contadorInputSeleccionado === 0) {
                    //// ESTABLECER LA COORDENADA INICIAL
                    ovariables.coordenadaInicialSeleccionadaJson.fila = 0;
                    ovariables.coordenadaInicialSeleccionadaJson.columna = 0;
                    fn_set_color_input_seleccionado_control(o);
                }

                let totalSeleccionados = Array.from(divform.getElementsByClassName('cls_input_selected')).length;

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
                Array.from(divForm.getElementsByClassName('cls_div_columnas_filas'))
                    .forEach(x => {
                        Array.from(x.getElementsByClassName('cls_div_deleteinput_selected'))
                            .forEach(y => {
                                x.removeChild(y);
                            });
                    });
            }
        }

        function handlerDeleteInputMultiseleccion(divForm) {
            divForm.getElementsByClassName('cls_spn_deleteinput_multiseleccion')[0].addEventListener('click', function (e) { let o = e.currentTarget; fn_deleteinput_multiseleccion(o, divForm); }, false);
        }

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

            ovariables.coordenadaInicialSeleccionadaJson.fila = 0;
            ovariables.coordenadaInicialSeleccionadaJson.columna = 0;
            ovariables.contadorInputSeleccionado = 0;
            ovariables.direccionInputSeleccionado = ''; //// PARA INDICAR QUE LA DIRECCION SERA POR FILA O POR COLUMNA
            ovariables.arrNumeracionInputsSeleccionadosFila_o_Columna = [];
        }

        function fn_set_color_input_seleccionado_control(o) {
            let div_parent = o.parentNode.parentNode;
            if (o.classList.value.indexOf("cls_input_selected") >= 0) {
                div_parent.classList.add("cls_backcolor_div_control_seleccionado");
            } else {
                div_parent.classList.remove("cls_backcolor_div_control_seleccionado");
            }

        }

        function fn_solo_click_input_delascolumnas(divInput) {
            let divForm = divInput.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            //// cls_submenu_input = PARA EL BOTON ELIMINAR
            let div_submenu = divInput.getElementsByClassName('cls_submenu_input')[0];
            let estado_inicial_submenu = div_submenu.classList.value.indexOf('d-none') < 0 ? true : false;

            //// OCULTAR PRIMERO A TODOS LOS SUBMENUS
            Array.from(divForm.getElementsByClassName('cls_submenu_input'))
                .forEach(x => {
                    x.classList.add('d-none');
                });

            let esta_visible_submenu = div_submenu.classList.value.indexOf('d-none');

            if (esta_visible_submenu < 0) {
                //// ESTA VISIBLE
                div_submenu.classList.add('d-none');
            } else {
                //// ESTA INVISIBLE
                if (estado_inicial_submenu) {
                    div_submenu.classList.add('d-none');
                } else {
                    div_submenu.classList.remove('d-none');
                }
            }
        }

        function fn_handler_delete_input(e) {
            let o = e.currentTarget;
            let div_form_group = o.parentNode.parentNode.parentNode;
            Array.from(div_form_group.children)
                .forEach(x => {
                    div_form_group.removeChild(x);

                });
            div_form_group.innerHTML = '<p>Arrastrar aqui</p>';
        }

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
                    div_input_column.addEventListener("dragleave", handlerDragLeave, false);
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
            let arrform = Array.from(document.getElementById('body_columns_3cero').getElementsByClassName('cls_div_form'));
            let ultimoindice = arrform.length - 1;
            let divform = arrform[ultimoindice];
            let data_nombreform = divform.getAttribute('data-divformgenerado');
            let classindexgenerado = 'cls_div_form_' + ultimoindice;

            divform.classList.remove(data_nombreform);
            divform.setAttribute('data-divformgenerado', classindexgenerado);
            divform.classList.add(classindexgenerado);
            return classindexgenerado;
        }

        function handler_divform_final_add() {
            //// FORM
            let ultimodiv = Array.from(document.getElementById('body_columns_3cero').getElementsByClassName('cls_div_form')).length;
            ultimodiv = ultimodiv - 1;

            fn_setearindex_form_add();

            let divform = document.getElementById('body_columns_3cero').getElementsByClassName('cls_div_form')[ultimodiv];
            divform.addEventListener('dragstart', handlerDragStarForm, false);
            divform.addEventListener('dragend', handlerDragEndForm, false);

            //// LOS INPUTS ARRASTRADOS EN LAS COLUMNAS
            Array.from(divform.getElementsByClassName("cls_input_delascolumnas"))
                .forEach(x => {
                    x.addEventListener("dragstart", handleDragStart_inputs_delascolumnas, false);
                    x.addEventListener("dragend", handlerDragEnd_inputs_delascolumnas, false);
                    x.addEventListener("click", fn_click_input_delascolumnas, false);
                });

            Array.from(divform.getElementsByClassName('cls_delete_input'))
                .forEach(x => {
                    x.addEventListener('click', fn_handler_delete_input, false);
                });

            divform.getElementsByClassName('cls_row_where_drop')[0].addEventListener("dragover", handlerDragOverColumnas, false);
            divform.getElementsByClassName('cls_row_where_drop')[0].addEventListener("drop", handleDropColumnas, false);
            divform.getElementsByClassName('cls_row_where_drop')[0].addEventListener("dragleave", handlerDragLeaveColumnas, false);


            //// PARA LOS DIVS DE COLUMNAS YA ARRASTRADAS
            Array.from(divform.getElementsByClassName("div_drop"))
                .forEach(x => {
                    x.addEventListener("dragover", handleDragOver, false);
                    x.addEventListener("drop", handleDrop, false);
                    x.addEventListener("dragleave", handlerDragLeave, false);
                });

            let btn_add_fila = divform.getElementsByClassName('cls_btn_add_fila')[0];
            btn_add_fila.addEventListener('click', fn_add_fila_paracolumnas, false);

            handler_divform_elegido_drop();
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