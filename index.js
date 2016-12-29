(function() {
	"use strict";

	document.addEventListener("DOMContentLoaded", function() {

		/**
		 * @constructor
		 * */
		var FabulaAjaxer = function() {
			this.init();
		};

		FabulaAjaxer.prototype = {

			"pressedKeys": Object.create(null),


			/**
			 * Короткий ctx.querySelectorAll
			 * */
			_qsa: function(selector, node) {
				node = node || document;
				return Array.prototype.slice.call(node.querySelectorAll(selector), 0);
			},


			/**
			 * Инициализация
			 * */
			"init": function() {
				var self = this;

				this.ajaxStartDate = 0;
				this.ajaxResTime = 0;

				this.intervals = {
					"loading": null
				};

				this._initStyles();

				this._initAjaxerModal();

				this._initEvents();

				document.addEventListener("keydown", self._keyDownEvent.bind(self));

				document.addEventListener("keyup", self._keyUpEvent.bind(self));

				console.log("Ajaxer init: done");

				self.selectTab('query');
				self.close();
			},


			/**
			 * Инициализация стилей
			 * */
			"_initStyles": function() {
				var body = document.querySelector("body");

				var css = '' +
					'.fabula-ajaxer {' +
						'position: absolute; ' +
						'left: 0; ' +
						'top: 0; ' +
						'min-width: 800px; ' +
						'height: auto; ' +
						'margin: 16px; ' +
						'padding: 16px; ' +
						'background-color: #FFF; ' +
						'border: 2px solid black; ' +
						'box-shadow: 5px 5px 0px rgba(0, 0, 0, 0.35); ' +
						'font-size: 12px; ' +
						'font-family: sans-serif;' +
					'}' +

					'.fabula-ajaxer__input {' +
						'position: relative;' +
						'display: block; ' +
						'width: 100%;' +
						'height: auto;' +
						'padding: 2px;' +
						'border: 1px solid blue;' +
						'border-radius: 0px;' +
						'margin: 5px 0;' +
						'border: 2px solid black;' +
						'box-sizing: border-box;' +
					'}' +

					'.fabula-ajaxer__input:focus { outline:none; border-color:blue }' +

					'.fabula-ajaxer__btn {' +
						'background: black;' +
						'border: black;' +
						'border-radius: 0;' +
						'padding: 5px;' +
						'color: white;' +
						'font-weight: bold;' +
						'cursor: pointer;' +
					'}' +

					'.fabula-ajaxer__btn:hover {' +
						'background-color: blue;' +
						'color: yellow;' +
					'}' +

					'.fabula-ajaxer__btn:focus {' +
						'background-color: blue;' +
						'color: yellow;' +
					'}' +

					'.fabula-ajaxer-btn-group {' +
						'border: 2px solid black;' +
						'display: inline-block;' +
					'}' +

					'.fabula-ajaxer-btn-group__btn {' +
						'margin: 0;' +
						'display: inline-block;' +
						'background: white;' +
						'color: black;' +
					'}' +

					'.fabula-ajaxer-btn-group__btn_active {' +
						'background: black;' +
						'color: white;' +
					'}' +

					'.fabula-ajaxer__submit {}'+

					'.fabula-ajaxer__submit:hover {' +
						'background-color: blue;' +
						'color: yellow;' +
					'}' +

					'.fabula-ajaxer__table {' +
						'position: relative;'+
						'width: 100%;'+
						'height: auto;'+
						'margin-bottom: 16px;'+
						'border-spacing: 0px;' +
						'border-collapse: collapse;' +
						'border-sizing: border-box'+
					'}'+

					'.fabula-ajaxer__table-container {' +
						'position: relative;' +
						'width: 1024px;' +
						'height: 480px;' +
						'overflow-y: scroll;' +
						'resize: both;' +
					'}' +

					'.fabula-ajaxer__devider-vertical {' +
						'position: relative;' +
						'margin: 10px 0;' +
						'border-top: 1px dotted #e6e6e6;' +
					'}'+

					'.fabula-ajaxer__table-row {' +
						'padding: 5px;' +
						'border: none;' +
						'margin: 0;' +
					'}'+

					'.fabula-ajaxer__table-row:nth-child(odd) {' +
						'background-color :#e6e6e6;' +
					'}' +


					'.fabula-ajaxer__table-row:hover {background-color:blue;' +
						'color: yellow;' +
					'}' +

					'.fabula-ajaxer__table-hrow {background-color:black;' +
						'color: white;' +
						'font-weight: bold;' +
					'}' +

					'.fabula-ajaxer__table-hcol {' +
						'padding: 5px;' +
						'border: 2px solid black;' +
						'border-right-color: white;' +
					'}' +

					'.fabula-ajaxer__table-hcol:last-child {' +
						'border-right-color: black;' +
					'}' +

					'.fabula-ajaxer__table-col {' +
						'padding: 2px;' +
						'border: 2px solid black;' +
					'}' +

					'.fabula-ajaxer_hidden {' +
						'display: none;' +
					'}';

				var styleElem = document.querySelector("#fabulaAjaxerStyles");

				if (!styleElem) {
					styleElem = document.createElement("style");
					styleElem.innerHTML = css;
					body.appendChild(styleElem);
				}
			},


			/**
			 * Инициализация модального окна
			 * */
			"_initAjaxerModal": function() {
				var body = document.body,
					modalElem = document.querySelector(".fabula-ajaxer");

				if (!modalElem) {
					modalElem = document.createElement("div");
					modalElem.className = "fabula-ajaxer";

					modalElem.innerHTML = '' +
						'<div class="fabula-ajaxer-btn-group fabula-ajaxer__pages">' +
							'<div class="fabula-ajaxer__btn fabula-ajaxer-btn-group__btn fabula-ajaxer__tab-query">Запрос</div>' +
							'<div class="fabula-ajaxer__btn fabula-ajaxer-btn-group__btn fabula-ajaxer__tab-script">Скрипт</div>' +
						'</div>' +
						'<div class="fabula-ajaxer__page">' +
							'<input type="text" class="fabula-ajaxer__input fabula-ajaxer-db-filename-input" value="main">' +
							'<textarea class="fabula-ajaxer__input fabula-ajaxer-db-query">SELECT TOP 10 * FROM Movement</textarea>' +
							'<div>' +
								'<input type="submit" class="fabula-ajaxer__btn fabula-ajaxer__submit">' +
							'</div>' +
							'<div class="fabula-ajaxer__devider-vertical"></div>' +
							'<div class="fabula-ajaxer__table-container"></div>' +
						'</div>' +
						// '<div class="fabula-ajaxer__pages">' +
							// '<textarea class="fabula-ajaxer__input fabula-ajaxer__db-postscript" placeholder="Здесь можно записать скрипт для выполнения"></textarea>' +
						// '</div>' +
						'';

					body.appendChild(modalElem);
				}

				this.el = modalElem;
			},


			/**
			 * Инициализация и прослушивание событиий
			 * */
			"_initEvents": function() {
				var self = this;

				this.hotkeyEvents["17-18-32"] = [{
					"keys": ["17", "18", "32"],
					"method": self._eventToggleOpen.bind(self)
				}];

				// ------------------------------------------------------------

				this.el
					.querySelector(".fabula-ajaxer__submit")
					.addEventListener("click", self._eventClickRunQuery.bind(self), false);

				this.el
					.querySelector(".fabula-ajaxer-db-query")
					.addEventListener("keydown", function(e) {
						!this._keyPressed && (this._keyPressed = {});
						this._keyPressed[e.keyCode] = 1;

						if (Object.keys(this._keyPressed).sort().join("-") == "13-18")
							self._eventClickRunQuery.call(self);
					}, false);

				this.el
					.querySelector(".fabula-ajaxer-db-query")
					.addEventListener("keyup", function(e) {
						!this._keyPressed && (this._keyPressed = {});
						delete this._keyPressed[e.keyCode];
					}, false);

				this._qsa('.fabula-ajaxer-btn-group__btn', this.el).forEach((elem) => {
					elem.addEventListener('click', function() {
						var modActive = 'fabula-ajaxer-btn-group__btn_active';

						self._qsa('.fabula-ajaxer-btn-group__btn', this.parentNode).forEach((a) => {
							a == this
								? a.classList.add(modActive)
								: a.classList.remove(modActive)
						});
					}, !1);
				});

				// ------------------------------------------------------------

				self._keyDownEvent = function(e) {
					self.pressedKeys[e.keyCode] = 1;

					var pressedKeysStr = self.getPressedKeys().sort().join("-");

					self.hotkeyEvents[pressedKeysStr]
					&& self.hotkeyEvents[pressedKeysStr].forEach((keyEvent) => {
						keyEvent.method()
					});
				};


				self._keyUpEvent = function(e) {
					delete self.pressedKeys[e.keyCode];
				};

			},


			"hotkeyEvents": {},


			/**
			 * Получить коды нажатых кнопок
			 * @return {Array}
			 * */
			"getPressedKeys": function() {
				return Object.keys(this.pressedKeys);
			},


			/**
			 * Обраотчик для submit
			 * */
			"_eventClickRunQuery": function() {
				var query       = this.el.querySelector('.fabula-ajaxer-db-query').value,
					dbFileName  = this.el.querySelector('.fabula-ajaxer-db-filename-input').value;

				this.loading(true);

				this.dbQuery({
					"query": query,
					"dbFileName": dbFileName
				});
			},


			/**
			 * Событие: открыть-закрыть модальное окно
			 * */
			"_eventToggleOpen": function() {
				if (!this.el.classList.contains("fabula-ajaxer_hidden"))
					return this.close();

				this.open();
			},


			/**
			 * Обработчик ответа от БД
			 * @param {Object} dbres - обьект ответа из БД
			 * */
			"_ajaxCallback": function(dbres) {
				var c,
					self = this,
					html = '',
					container = this.el.querySelector(".fabula-ajaxer__table-container");

				this.loading(false);

				dbres = eval("(" + dbres + ")");

				// {"err":"","t":0.004,"recs":1,"fld":[{"Name":"uid","Type":"N","fType":3},{"Name":"Val","Type":"C","fType":202}],"res":[[221749,""]]}

				self.lastDbRes = dbres;

				var buildTable = function(dbres) {
					var c, col, row,
						stats = [];

					if (dbres.err) {
						html = dbres.err;

					} else {
						stats.push("dbres.t = " + dbres.t + " s");
						stats.push("dbres.recs = " + dbres.recs);
						stats.push("ajaxResTime = " + self.ajaxResTime + " s");

						if (!dbres.recs)
							return html += "<div>Записей по данному запросу не найдено</div>";

						html += '<div title="' + stats.join("\n") + '" style="border: 2px solid black; padding: 8px; margin-bottom: 4px;">' + stats.join("<br />") + '</div>';
						html += '<table class="fabula-ajaxer__table">';
						html += '<thead>';
						html += '<tr class="fabula-ajaxer__table-hrow">';

						for (c = 0; c < dbres.fld.length; c++)
							html += '<th class="fabula-ajaxer__table-hcol">' + dbres.fld[c].Name + '</th>';

						html += '</tr>';
						html += '</thead>';
						html += '<tbody>';

						for (row = 0; row < dbres.res.length; row++) {
							html += '<tr class="fabula-ajaxer__table-row">';

							for (col = 0; col < dbres.res[row].length; col++)
								html += '<td class="fabula-ajaxer__table-col">' + dbres.res[row][col] + '</td>';

							html += '</tr>';
						}

						html += '</tbody>';
						html += '</table>';
					}
				};

				if (dbres.hasOwnProperty(0))
					for (c = 0; c < dbres.length; c++) buildTable(dbres[c]);
				else
					buildTable(dbres);

				// statsContainer.innerHTML = stats.join("\n");
				container.innerHTML = html;
			},


			/**
			 * Запрос
			 * @param {Object} arg
			 * @param {String} arg.query - SQL текст запроса
			 * @param {String} arg.dbFileName - источник данных
			 * */
			"dbQuery": function(arg) {
				if (
					typeof arg != "object"
					|| typeof arg.query != "string"
					|| typeof arg.dbFileName != "string"
				) return;

				var self = this,
					query = arg.query,
					dbFileName = arg.dbFileName;

				self.ajaxStartDate = new Date();
				self.lastDbRes = void 0;

				Ajax(
					"./db",
					{
						"Conf":     db.dbName,
						"Command":  "query",
						"Src":      dbFileName,
						"Sql":      query,
						"Ok":       0,
						"Cache":    "*_Ajaxer"
					},
					function(dbres) {
						self._ajaxCallback(dbres);
						self.ajaxResTime = (new Date() - self.ajaxStartDate) / 1000;
					}
				);
			},


			/**
			 * Заблокировать экран показать иконку "загрузка"
			 * */
			"loading": function(arg) {
				if (arg == void 0) arg = false;

				arg = Boolean(arg);

				var container = this.el.querySelector(".fabula-ajaxer__table-container");

				container.innerHTML = "";

				if (!arg) return;

				container.innerHTML = '<img src="./jFabula/img/loading.gif" style="width:16px">';
			},


			"selectTab": function(tabName) {
				return;
				var modActive = 'fabula-ajaxer-btn-group__btn_active';
				this._qsa('.fabula-ajaxer__pages .' + modActive)[0].classList.remove(modActive);
				this._qsa('.fabula-ajaxer__pages .fabula-ajaxer__tab-' + tabName)[0].classList.add(modActive);
			},


			/**
			 * Открыть окно
			 * */
			"open": function() {
				this.el.classList.remove("fabula-ajaxer_hidden");
				this.el.querySelector('.fabula-ajaxer-db-query').focus();
			},


			/**
			 * Закрыть окно
			 * */
			"close": function() {
				this.el.classList.add("fabula-ajaxer_hidden");
			}

		};

		if (!window._egUtils)
			window._egUtils = Object.create(null);

		window._egUtils.fabulaAjaxer = new FabulaAjaxer();
	});
})();