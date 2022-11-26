import { NumUtil, StringUtil } from '../util';
import { FormResponse, IFormResponse } from './base';
import { FormConstants, Protocol, XmlNames } from './constants';
import {
   Button,
   CheckBox,
   ComboBox,
   ComboBoxItem,
   Constraint,
   DatePicker,
   FormControl,
   GroupBox,
   Label,
   List,
   ListCell,
   ListColumn,
   ListRow,
   Panel,
   Position,
   TextBox,
} from './elements';

/**
 * The Node.localName property has been removed from the TypeScript typings (lib.dom.d.ts). Probably because
 * the property has been marked obsolete, and will be removed from browsers.
 * See: https://developer.mozilla.org/en-US/docs/Web/API/Node/localName
 *
 * TODO: Remove this interface, and all references to it, along with all the references to Node.localName.
 */
interface DeprecatedNode extends Node {
   /**
    * @deprecated https://developer.mozilla.org/en-US/docs/Web/API/Node/localName
    */
   localName?: string;
}

/**
 * @hidden
 * @since 2.0.0
 */
export class ParserInfo {
   parseLayout: boolean;
   parseConstraint: boolean;
}

/**
 * @hidden
 * @since 2.0.0
 */
export class FormParser {
   private static domParser: DOMParser;
   private static counter = 0;
   private static idCounter = 0;
   private uniqueNames: any;

   public static parseXml(content: string): Document {
      if (!FormParser.domParser) {
         FormParser.domParser = new DOMParser();
      }
      return FormParser.domParser.parseFromString(content, 'text/xml');
   }

   public static parse(content: string): FormResponse {
      return new FormParser().parseReponse(content);
   }

   public static selectRoot(document: Document) {
      return XmlUtil.selectNode(document, XmlNames.elementRoot);
   }

   private parseName(node: Node): string {
      return XmlUtil.getAttribute(node, XmlNames.attributeName);
   }

   private generateName(prefix: string, left: number, top: number): string {
      return prefix + '_L' + left + 'T' + top;
   }

   private parseSession(node: Node, element: FormResponse) {
      element.sessionId = XmlUtil.getElement(node, XmlNames.elementSessionId);
      if (element.sessionId) {
         element.instanceId = XmlUtil.getElement(
            node,
            XmlNames.elementInstanceId
         );
      }
      element.principalUser = XmlUtil.getElement(
         node,
         XmlNames.elementPrincipalUser
      );
      element.result = XmlUtil.getElementInt(node, XmlNames.elementResult, 0);
      element.language = XmlUtil.getElement(node, XmlNames.elementLanguage);
   }

   private parseUserData(node: Node, element: FormResponse) {
      const childNodes = node.childNodes;
      if (childNodes) {
         const userData = {};
         for (let i = 0; i < childNodes.length; i++) {
            const valueNode: DeprecatedNode = childNodes[i];
            userData[valueNode.localName] = valueNode.textContent;
         }
         element.userData = userData;
      }
   }

   private parseControlData(node: Node, element: FormResponse) {
      const message = XmlUtil.getElement(node, XmlNames.elementMessage);
      if (message) {
         element.message = message;
         element.messageId = XmlUtil.getElement(
            node,
            XmlNames.elementMessageId
         );
         element.messageLevel = XmlUtil.getElement(
            node,
            XmlNames.elementMessageLevel
         );
      }
      this.parseDialog(node, element);
   }

   private parseDialog(node: Node, element: IFormResponse) {
      const dialogNode = XmlUtil.selectNode(node, XmlNames.elementOpenDialog);
      if (dialogNode) {
         element.isDialog = true;
         element.dialogType = XmlUtil.getAttribute(
            dialogNode,
            XmlNames.attributeType
         );
      }
   }

   private parseReponse(content: string): FormResponse {
      const document = FormParser.parseXml(content);
      const element = new FormResponse();
      element.counter = ++FormParser.counter;

      this.uniqueNames = {};

      const root = FormParser.selectRoot(document);
      if (root) {
         element.document = document;
         const sessionNode = XmlUtil.selectNode(
            root,
            XmlNames.elementSessionData
         );
         if (sessionNode) {
            this.parseSession(sessionNode, element);
            const controlDataNode = XmlUtil.selectNode(
               root,
               XmlNames.elementControlData
            );
            if (controlDataNode) {
               this.parseControlData(controlDataNode, element);
            }
         } else {
            element.result = XmlUtil.getElementInt(
               root,
               XmlNames.elementResult,
               0
            );
            element.message = XmlUtil.getElement(root, XmlNames.elementMessage);
         }

         const userDataNode = XmlUtil.selectNode(
            root,
            XmlNames.elementUserData
         );
         if (userDataNode) {
            this.parseUserData(userDataNode, element);
         }

         const panels = document.getElementsByTagName(XmlNames.elementPanel);
         if (panels == null) {
            return element;
         }

         for (let i = 0; i < panels.length; i++) {
            this.parsePanel(panels[i], element);
         }
      } else {
         // TODO
      }

      return element;
   }

   private parsePosition(parentNode: Node): Position {
      const node = XmlUtil.selectNode(parentNode, XmlNames.elementPosition);
      if (node == null) {
         return null;
      }

      const element = new Position();
      element.top = XmlUtil.getIntAttribute(node, XmlNames.attributeTop, 0);
      element.left = XmlUtil.getIntAttribute(node, XmlNames.attributeLeft, 0);
      element.width = XmlUtil.getIntAttribute(node, XmlNames.attributeWidth, 0);
      element.height = XmlUtil.getIntAttribute(
         node,
         XmlNames.attributeHeight,
         0
      );
      return element;
   }

   private parseAccess(node: Node, element: FormControl) {
      const access = XmlUtil.getAttribute(node, XmlNames.attributeAccess);
      let visible = true;
      let enabled = true;

      if (XmlNames.valueWriteDisabled === access) {
         enabled = false;
      } else if (XmlNames.valueHidden === access) {
         visible = false;
      } else if (XmlNames.valueReadDisabled === access) {
         element.isReadDisabled = true;
      }

      element.isEnabled = enabled;
      element.isVisible = visible;
   }

   private parseConstraints(parentNode: Node): Constraint {
      const node = XmlUtil.selectNode(parentNode, XmlNames.elementConstraints);
      if (node == null) {
         return null;
      }

      const element = new Constraint();
      element.maxLength = XmlUtil.getIntAttribute(
         node,
         XmlNames.attributeMaxLength,
         0
      );
      element.isNumeric =
         XmlUtil.getAttribute(node, XmlNames.attributeType) ===
         XmlNames.valueDecimal;

      if (element.isNumeric) {
         element.maxDecimals = XmlUtil.getIntAttribute(
            node,
            XmlNames.attributeMaxDecimals,
            0
         );
      } else {
         element.isUpper = XmlUtil.hasAttribute(
            node,
            XmlNames.attributeUpperCase
         );
      }
      return element;
   }

   private parseStyle(node: Node, element: TextBox) {
      const style = XmlUtil.getAttribute(node, XmlNames.attributeStyle);
      if (style == null) {
         return;
      }

      switch (style) {
         case XmlNames.valueStyleReverse:
            element.isReverse = true;
            break;
         case XmlNames.valueStyleHighIntensity:
            element.isHighIntensity = true;
            break;
         case XmlNames.valueStyleReverseIntensity:
            element.isReverse = true;
            element.isHighIntensity = true;
            break;
      }
   }

   private parseElement(node: Node, element: FormControl) {
      this.parseAccess(node, element);
      element.position = this.parsePosition(node);
      const count = ++FormParser.idCounter;
      element.id = 'm3od-ctl-' + count;
   }

   private parseInputElement(node: Node, element: FormControl) {
      this.parseElement(node, element);
      if (!element.name) {
         element.name = this.parseName(node);
      }

      element.originalName = XmlUtil.getAttribute(
         node,
         XmlNames.attributeOriginalName
      );
      element.tabIndex = XmlUtil.getIntAttribute(
         node,
         XmlNames.attributeTab,
         -1
      );
      element.fieldHelp = XmlUtil.getAttribute(node, XmlNames.attributeHelp);

      // TODO Scripts

      const file = XmlUtil.getAttribute(node, XmlNames.attributeReferenceFile);
      if (file) {
         element.referenceFile = file;
         element.referenceField = XmlUtil.getAttribute(
            node,
            XmlNames.attributeReferenceField
         );
      }

      element.constraint = this.parseConstraints(node);
   }

   private parseButton(node: Node): FormControl {
      const element = new Button();
      element.name = this.parseName(node);
      element.value = node.textContent;

      this.parseInputElement(node, element);

      const progId = XmlUtil.getAttribute(node, XmlNames.attributeProgId);
      if (progId != null) {
         element.progId = progId;
         element.arguments = XmlUtil.getAttribute(
            node,
            XmlNames.attributeArgument
         );
      } else {
         element.command = XmlUtil.getAttribute(
            node,
            XmlNames.attributeCommand
         );
         element.commandValue = XmlUtil.getAttribute(
            node,
            XmlNames.attributeValue
         );
      }

      return element;
   }

   private parseGroupBox(node: Node): GroupBox {
      const element = new GroupBox();
      this.parseElement(node, element);

      if (element.position) {
         element.name = this.generateName(
            'GRP',
            element.position.left,
            element.position.top
         );
      }
      element.isLine = XmlUtil.getBoolAttribute(node, 'r', false);
      element.value = node.textContent;

      return element;
   }

   private parseLabel(node: Node): FormControl {
      const element = new Label();
      this.parseElement(node, element);

      let name = XmlUtil.getAttribute(node, 'id');
      element.id = name;
      element.value = node.textContent;

      const position = element.position;
      if (position) {
         // TODO IsNullOrEmpty
         if (!name || name.length < 2) {
            // Generate a name to be used for hiding controls etc.
            // Captions with the text '-' and '/' gets the same as name and this is handled by checking if the length is less than 2.
            name = this.generateName('LBL', position.left, position.top);
         } else if (this.uniqueNames[name]) {
            // A label with the same name already exist, generate a new name
            name = this.generateName('LBL', position.left, position.top);
         } else {
            this.uniqueNames[name] = name;
         }
      }

      element.name = name;

      element.toolTip = XmlUtil.getAttribute(node, 'tip');
      element.isFixed = XmlUtil.getBoolAttribute(node, 'fixFnt', false);
      element.isAdditionalInfo = XmlUtil.getBoolAttribute(
         node,
         'addInfo',
         false
      );
      element.isEmphasized = XmlUtil.getBoolAttribute(node, 'emp', false);
      element.isColon = XmlUtil.getBoolAttribute(node, 'cl', false);

      return element;
   }

   private parseCheckBox(node: Node): FormControl {
      const element = new CheckBox();
      this.parseInputElement(node, element);
      element.value = node.textContent;
      element.isChecked = '1' === element.value;
      return element;
   }

   private parseComboBox(node: Node, isPosition: boolean): ComboBox {
      const element = new ComboBox();
      element.name = this.parseName(node);
      element.isPosition = isPosition;

      this.parseInputElement(node, element);

      if (XmlUtil.getAttribute(node, 'e') != null) {
         element.isEditable = true;
         element.value = XmlUtil.getAttribute(node, XmlNames.attributeValue);
      }

      const itemNodes = node.childNodes;
      if (itemNodes) {
         for (let i = 0; i < itemNodes.length; i++) {
            const itemNode: DeprecatedNode = itemNodes[i];
            if (itemNode.localName === XmlNames.elementComboBoxValue) {
               const item = new ComboBoxItem();
               item.value = XmlUtil.getAttribute(
                  itemNode,
                  XmlNames.attributeValue
               );
               item.text = itemNode.textContent;
               if (XmlUtil.hasAttribute(itemNode, XmlNames.attributeSelected)) {
                  element.selected = item;
                  item.isSelected = XmlUtil.hasAttribute(
                     itemNode,
                     XmlNames.attributeSelected
                  );
                  if (!element.value) {
                     element.value = item.value;
                  }
               }
               element.items.push(item);
            }
         }
      }

      element.command = XmlUtil.getAttribute(node, XmlNames.attributeCommand);
      if (element.command != null) {
         element.commandValue = XmlUtil.getAttribute(
            node,
            XmlNames.attributeValue
         );
      }

      if (isPosition) {
         // List position fields are always enabled and visible.
         element.isEnabled = true;
         element.isVisible = true;
      }

      return element;
   }

   private parseTextBox(
      node: Node,
      isPosition: boolean,
      panelElement: Panel
   ): TextBox {
      let element: TextBox;
      const dateFormat = XmlUtil.getAttribute(node, 'df');
      if (
         dateFormat != null &&
         !isPosition &&
         !(dateFormat.indexOf('YYWWD') >= 0)
      ) {
         element = new DatePicker(
            dateFormat,
            XmlUtil.getBoolAttribute(node, 'hDf', false)
         );
      } else {
         element = new TextBox();
      }

      element.name = this.parseName(node);
      element.value = node.textContent;

      this.parseInputElement(node, element);
      this.parseStyle(node, element);

      if (isPosition) {
         // List position fields are always enabled and visible.
         element.isEnabled = true;
         element.isVisible = true;
      } else {
         element.isBrowsable = XmlUtil.hasAttribute(node, 'browse');
      }

      element.isRightAligned = XmlUtil.hasAttribute(
         node,
         XmlNames.attributeJustification
      );

      if (panelElement != null) {
         if (element.name === FormConstants.fieldInformationCategory) {
            panelElement.informationCategory = element.value;
         } else if (
            element.name === FormConstants.fieldHideCommandBar &&
            element.value === '1'
         ) {
            panelElement.hideCommandBar = true;
         }
      }

      return element;
   }

   private getStringTrimEnd(node: Node) {
      const text = XmlUtil.getText(node);
      return text ? StringUtil.trimEnd(text) : null;
   }

   private getRowIndex(rowName: string): number {
      try {
         return parseInt(rowName.substring(1), 10) - 1; // 1-based list
      } catch (ignore) {
         /* empty */
      }
      return -1;
   }

   private parseListRow(rowNode: Node, listElement: List): ListRow {
      const nodes = XmlUtil.selectNodes(rowNode, XmlNames.elementListCell);
      if (!nodes) {
         return null;
      }

      const row = new ListRow();
      row.items = [];
      row.name = XmlUtil.getAttribute(rowNode, XmlNames.attributeName);
      row.columnCount = nodes.length;
      row.isProtected = XmlUtil.hasAttribute(
         rowNode,
         XmlNames.attributeProtected
      );
      row.isSelected = XmlUtil.hasAttribute(
         rowNode,
         XmlNames.attributeSelected
      );

      // TODO Should this be possible to configure?
      const isEditableListEnabled = true;

      for (let i = 0; i < nodes.length; i++) {
         const listColumn = listElement.columns[i];
         const node = nodes[i];

         const cell = new ListCell();
         const text = this.getStringTrimEnd(node);
         row[listColumn.fullName] = text;
         cell.text = text;
         cell.isRight = XmlUtil.hasAttribute(
            node,
            XmlNames.attributeJustification
         );
         cell.isBool = listColumn.isBool();

         const access = XmlUtil.getAttribute(node, XmlNames.attributeAccess);
         if (access) {
            if (XmlNames.valueWriteEnabled === access) {
               if (isEditableListEnabled) {
                  cell.isUpper = listColumn.isUpperCase;
                  let maxLength = listColumn.maxLength;
                  if (listColumn.isNumeric) {
                     if (listColumn.maxDecimals > 0) {
                        maxLength += 2; // Sign + decimal separator
                     } else {
                        maxLength += 1; // Sign
                     }
                  }
                  cell.maxLength = maxLength;

                  // TODO Get min width
                  // minWidth = (int) VisualUtil.GetMinTextBoxWidth(maxLength);

                  cell.isEditable = true;
                  cell.isEnabled = true;
               }
            } else if (XmlNames.valueHidden === access) {
               cell.isHidden = true;
            }
         }

         if (cell.isBool) {
            cell.isChecked = Protocol.valueTrue === cell.text;
            if (!cell.isEditable) {
               if (cell.isChecked) {
                  // Show a disabled CheckBox for read-only true bool values
                  cell.isEditable = true;
               } else {
                  // Show blank for read-only false bool values
                  cell.isBool = false;
               }
            }
         }

         const style = XmlUtil.getAttribute(node, XmlNames.attributeStyle);
         if (style != null) {
            if (XmlNames.valueStyleReverseIntensity === style) {
               cell.isReverse = true;
               cell.isHighIntensity = true;
            } else if (XmlNames.valueStyleReverse === style) {
               cell.isReverse = true;
            } else if (XmlNames.valueStyleHighIntensity === style) {
               cell.isHighIntensity = true;
            }
         }

         row.items.push(cell);
      }

      this.parseSubRows(rowNode, listElement, row);

      row.index = this.getRowIndex(row.name);

      return row;
   }

   private parseSubRows(rowNode: Node, listElement: List, row: ListRow) {
      const subRows = XmlUtil.selectNodes(rowNode, 'SR');
      if (!subRows || subRows.length === 0) {
         return;
      }

      listElement.hasSubRows = true;
      const subRow = subRows[0];
      const subNodes = XmlUtil.selectNodes(subRow, 'SC');
      if (subNodes) {
         row.subItems = [];
         for (let j = 0; j < subNodes.length; j++) {
            const subNode = subNodes[j];
            const cell = new ListCell();
            cell.text = this.getStringTrimEnd(subNode);
            cell.span = XmlUtil.getIntAttribute(subNode, 'colspan', 0);
            cell.isRight = XmlUtil.hasAttribute(
               subNode,
               XmlNames.attributeJustification
            );
            row.subItems.push(cell);
         }
      }
   }

   private parseListRows(listNode: Node, listElement: List) {
      listElement.items = [];

      const nodes = XmlUtil.selectNodes(listNode, 'LView/LRows/LR');
      if (nodes == null) {
         return;
      }

      for (let i = 0; i < nodes.length; i++) {
         const row = this.parseListRow(nodes[i], listElement);
         if (row && row.index >= 0) {
            listElement.items.push(row);
         }
      }
   }

   private parseSubColumns(listNode: Node, listElement: List) {
      const nodes = XmlUtil.selectNodes(listNode, 'LView/LCols/LSubCol');
      if (!nodes || nodes.length === 0) {
         return;
      }

      listElement.subColumns = [];

      let index = listElement.columns.length;
      for (let i = 0; i < nodes.length; i++) {
         const column = this.parseColumn(nodes[i], index);
         listElement.subColumns.push(column);
         index++;
      }
   }

   private parseColumnName(columnNode: Node, columnElement: ListColumn) {
      const index = columnElement.index;
      let originalColumnName = XmlUtil.getAttribute(
         columnNode,
         XmlNames.attributeName
      );
      if (!originalColumnName) {
         if (index < 0) {
            return;
         }
         originalColumnName = '_' + index;
      }

      // We don't want property names starting with & so they are replaced with blank for now.
      // This might have to change if there can be naming conflicts
      originalColumnName = originalColumnName.replace('&', '');

      let name = originalColumnName;
      if (name.length > 4) {
         name = name.substring(name.length - 4);
      }

      if (NumUtil.isNumber(name[0])) {
         // Properties cannot start with a number
         name = '_' + name;
      }

      columnElement.name = name;
      columnElement.fullName = originalColumnName;
   }

   private parseHeader(columnNode: Node, column: ListColumn) {
      const node = XmlUtil.selectNode(columnNode, XmlNames.elementCaption);
      if (node) {
         column.header = XmlUtil.getText(node);
         column.toolTip = XmlUtil.getAttribute(node, 'tip');
      }
   }

   private parseColumn(columnNode: Node, index: number): ListColumn {
      const column = new ListColumn();
      column.index = index;

      this.parseColumnName(columnNode, column);
      this.parseHeader(columnNode, column);

      const constraint = this.parseConstraints(columnNode);
      if (constraint) {
         // TODO Is both constraint and properties needed?
         column.maxLength = constraint.maxLength;
         column.maxDecimals = constraint.maxDecimals;
         column.isUpperCase = constraint.isUpper;
         column.constraint = constraint;
      }

      column.columnType = XmlUtil.getAttribute(
         columnNode,
         XmlNames.attributeType
      );
      column.category = XmlUtil.getAttribute(
         columnNode,
         XmlNames.attributeCategory
      );
      column.width = XmlUtil.getIntAttribute(
         columnNode,
         XmlNames.attributeWidth,
         0
      );
      column.fieldHelp = XmlUtil.getAttribute(
         columnNode,
         XmlNames.attributeHelp
      );
      column.aggregate = XmlUtil.getIntAttribute(columnNode, 'agg', 0);
      column.aggregateDisplayRule = XmlUtil.getIntAttribute(
         columnNode,
         'adr',
         0
      );
      column.aggregateUpdateRule = XmlUtil.getIntAttribute(
         columnNode,
         'aur',
         0
      );
      column.isRight = XmlUtil.hasAttribute(
         columnNode,
         XmlNames.attributeJustification
      );

      return column;
   }

   private parseColumns(listNode: Node, listElement: List) {
      const nodes = XmlUtil.selectNodes(listNode, 'LView/LCols/LCol');
      listElement.columns = [];
      let depth = 0;
      for (let i = 0; i < nodes.length; i++) {
         const node = nodes[i];
         const listColumn = this.parseColumn(node, i);

         // Position fields
         let n = XmlUtil.selectNode(node, XmlNames.elementEntryField);
         if (n != null) {
            listColumn.positionField = this.parseTextBox(n, true, null);
         } else {
            n = XmlUtil.selectNode(node, XmlNames.elementComboBox);
            if (n != null) {
               listColumn.positionField = this.parseComboBox(n, true);
            }
         }

         // If the list column defines a field help ID it should override the field help of the position field.
         if (listColumn.positionField && listColumn.fieldHelp) {
            listColumn.positionField.fieldHelp = listColumn.fieldHelp;
         }

         if (listColumn.aggregate > 0) {
            listElement.isAggregate = true;
         } else {
            depth++;
         }

         listElement.columns.push(listColumn);
      }

      if (listElement.isAggregate) {
         listElement.aggregateDepth = depth;
      }
   }

   private parseList(responseElement: FormResponse, listNode: Node): List {
      const listElement = new List();
      listElement.isCleared = XmlUtil.getBoolAttribute(listNode, 'clr', false);

      this.parseInputElement(listNode, listElement);
      this.parseColumns(listNode, listElement);
      this.parseSubColumns(listNode, listElement);
      this.parseListRows(listNode, listElement);

      return listElement;
   }

   private parseObjects(
      nodes: NodeList,
      response: FormResponse,
      panelElement: Panel
   ) {
      for (let i = 0; i < nodes.length; i++) {
         const node: DeprecatedNode = nodes[i];
         let childElement: any = null;
         const name = node.localName;
         switch (name) {
            case XmlNames.elementButton:
               childElement = this.parseButton(node);
               break;
            case XmlNames.elementCaption:
               childElement = this.parseLabel(node);
               break;
            case XmlNames.elementCheckBox:
               childElement = this.parseCheckBox(node);
               break;
            case XmlNames.elementComboBox:
               childElement = this.parseComboBox(node, false);
               break;
            case XmlNames.elementSortingOrderComboBox:
               childElement = this.parseComboBox(node, false);
               childElement.isSpecial = true;
               panelElement.sortingOrderComboBox = childElement;
               break;
            case XmlNames.elementViewComboBox:
               childElement = this.parseComboBox(node, false);
               childElement.isSpecial = true;
               panelElement.viewComboBox = childElement;
               break;
            case XmlNames.elementEntryField:
               childElement = this.parseTextBox(node, false, panelElement);
               break;
            case XmlNames.elementSortingOrderEntryField:
               childElement = this.parseTextBox(node, false, panelElement);
               childElement.isSpecial = true;
               panelElement.sortingOrderTextBox = childElement;
               break;
            case XmlNames.elementViewEntryField:
               childElement = this.parseTextBox(node, false, panelElement);
               childElement.isSpecial = true;
               panelElement.viewTextBox = childElement;
               break;
            case XmlNames.elementGroupBox:
               childElement = this.parseGroupBox(node);
               break;
            case XmlNames.elementList:
               panelElement.list = this.parseList(response, node);
               break;
            case XmlNames.elementPanelSequence:
               panelElement.panelSequence = node.textContent;
               break;
            case XmlNames.elementFunctionKeys:
               // Not implemented
               break;
            case XmlNames.elementBasicOptions:
               this.parseBasicOptions(node, panelElement);
               break;
            case XmlNames.elementRelatedOptions:
               this.parseRelatedOptions(node, panelElement);
               break;
            case XmlNames.elementDocumentLinks:
               // Not implemented
               break;
            case XmlNames.elementPluggable:
               // Not implemented
               break;
            case XmlNames.elementTextArea:
               // Not implemented
               break;
            case XmlNames.elementJGanttData:
               // Not implemented
               break;
            case XmlNames.elementBarChart:
               // Not implemented
               break;
         }

         if (childElement) {
            panelElement.controlList.push(childElement);
            if (childElement.name) {
               panelElement.controls[childElement.name] = childElement;
            }
         }
      }
   }

   private parsePanel(node: Node, response: FormResponse) {
      const panelElement = new Panel();
      panelElement.name = this.parseName(node);

      panelElement.header = XmlUtil.getElement(
         node,
         XmlNames.elementPanelHeader
      );
      panelElement.description = XmlUtil.getElement(
         node,
         XmlNames.elementPanelDescription
      );

      const objectsNode = XmlUtil.selectNode(node, XmlNames.elementObjects);
      if (objectsNode) {
         this.parseObjects(objectsNode.childNodes, response, panelElement);
      }

      response.panels.push(panelElement);

      // Store the first returned panel in the panel property.
      if (!response.panel) {
         response.panel = panelElement;
      }
   }

   private parseBasicOptions(node: Node, element: Panel) {
      element.basicOptions = this.parseOptions(
         node,
         XmlNames.elementBasicOption
      );
      const last = element.basicOptions.pop();
      if (last['val'] !== 0) {
         element.basicOptions.push(last); // Push it back if its not related options
      }
   }

   private parseRelatedOptions(node: Node, element: Panel) {
      element.relatedOptions = this.parseOptions(
         node,
         XmlNames.elementRelatedOption
      );
   }

   private parseOptions(node: Node, optionNodeName: string): any[] {
      const options = [];

      const nodes: Node[] = XmlUtil.selectNodes(node, optionNodeName);
      if (nodes == null) {
         return options;
      }

      // TODO Typings for Node
      nodes.forEach((optionNode: any, index: number) => {
         options.push({
            option: optionNode.textContent,
            val: optionNode.attributes['val'].nodeValue,
         });
      });

      return options;
   }
}

/**
 * @hidden
 * @since 2.0.0
 */
export class XmlUtil {
   public static getBoolean(s: string, defaultValue = false) {
      if (s && s.length > 0) {
         return s[0].toLowerCase() === 't';
      }
      return defaultValue;
   }

   // TODO Typings for Node (node: Node)?
   public static getAttribute(node: any, name: string): string {
      const a = node.hasAttributes()
         ? node.attributes.getNamedItem(name)
         : null;
      return a != null ? a.textContent : null;
   }

   public static hasAttribute(node: Node, name: string): boolean {
      return XmlUtil.getAttribute(node, name) != null;
   }

   public static getBoolAttribute(
      node: Node,
      name: string,
      defaultValue: boolean
   ): boolean {
      const attribute = this.getAttribute(node, name);
      return this.getBoolean(attribute, defaultValue);
   }

   public static getIntAttribute(
      node: Node,
      name: string,
      defaultValue: number
   ): number {
      const attribute = this.getAttribute(node, name);
      return NumUtil.getInt(attribute, defaultValue);
   }

   public static selectNodes(parent: Node, path: string): Node[] {
      const nodes = [];
      XmlUtil.select(parent, path.split('/'), nodes);
      return nodes;
   }

   private static select(parent: Node, path: string[], nodes: Node[]) {
      let node;
      const name = path[0];
      if (path.length === 1) {
         // Last part of the path, add all matching controls
         for (let i = 0; i < parent.childNodes.length; i++) {
            node = parent.childNodes[i];
            if (node.localName === name) {
               nodes.push(node);
            }
         }
         return;
      }

      node = XmlUtil.selectNode(parent, name);
      if (!node) {
         return;
      }

      // Remove current level and continue
      path.splice(0, 1);
      XmlUtil.select(node, path, nodes);
   }

   public static selectNode(parent: Node, name: string): Node {
      if (parent.hasChildNodes()) {
         for (let i = 0; i < parent.childNodes.length; i++) {
            const node: DeprecatedNode = parent.childNodes[i];
            if (node.localName === name) {
               return node;
            }
         }
      }
      return null;
   }

   public static getElementInt(
      parent: Node,
      name: string,
      defaultValue: number
   ): number {
      const s = XmlUtil.getElement(parent, name);
      return s ? parseInt(s, 10) : defaultValue;
   }

   public static getElement(parent: Node, name: string): string {
      const node = this.selectNode(parent, name);
      return node != null ? node.textContent : null;
   }

   public static getText(parent: Node): string {
      return parent ? parent.textContent : null;
   }
}
