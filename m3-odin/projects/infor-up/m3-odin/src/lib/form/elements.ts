import { XmlNames } from "./constants";

/**
 * Defines constraints for a form control.
 *
 * ```typescript
 * import { Constraint } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class Constraint {
   /**
    * Gets or sets a value that indicates if the element is numeric.
    */
   public isNumeric = false;

   /**
    * Gets or sets a value that indicates if the element value is uppercase.
    */
   public isUpper = false;

   /**
    * Gets or sets the max length of the element value.
    */
   public maxLength = 0;

   /**
    * Gets or sets the max number of decimals of the element value.
    */
   public maxDecimals = 0;
}

/**
 * Defines the postion of a form control in the panel grid.
 *
 * ```typescript
 * import { Position } from '@infor-up/m3-odin';
 * ```
 *
 * The top and left properties are 1-indexed.
 *
 * @since 2.0.0
 */
export class Position {
   public top: number;
   public left: number;
   public width: number;
   public height: number;
}

/**
 * Defines the different types of form controls.
 *
 * ```typescript
 * import { ControlType } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class ControlType {
   public static label = 1;
   public static textBox = 2;
   public static checkBox = 3;
   public static comboBox = 4;
   public static datePicker = 5;
   public static groupBox = 6;
   public static button = 7;
   public static list = 8;
   public static listColumn = 9;

   public static getName(type: number) {
      switch (type) {
         case ControlType.label:
            return "Label";
         case ControlType.textBox:
            return "TextBox";
         case ControlType.checkBox:
            return "CheckBox";
         case ControlType.comboBox:
            return "ComboBox";
         case ControlType.datePicker:
            return "DatePicker";
         case ControlType.groupBox:
            return "GroupBox";
         case ControlType.button:
            return "Button";
         case ControlType.list:
            return "List";
         case ControlType.listColumn:
            return "ListColumn";
      }
      return null;
   }
}

/**
 * Base class for M3 form controls.
 *
 * ```typescript
 * import { FormControl } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class FormControl {
   /**
    * Gets or sets an automatically generated id for the control.
    */
   public id: string;

   /**
    * Gets or sets the name of the control.
    */
   public name: string;
   public originalName: string;
   public value: string;
   public fieldHelp: string;
   public referenceFile: string;
   public referenceField: string;
   public isEnabled: boolean;
   public isVisible: boolean;
   public isReadDisabled: boolean;
   public tabIndex: number;
   public masterColumn: number;
   public isSlave: boolean;

   /**
    * Indicates that this is a special control that should not be rendered on the panel.
    */
   public isSpecial: boolean;

   public position: Position;
   public constraint: Constraint;

   constructor(public type: number) {}

   public getTypeName() {
      return ControlType.getName(this.type);
   }

   public getLeft(): number {
      return this.position ? this.position.left : -1;
   }

   public getTop(): number {
      return this.position ? this.position.top : -1;
   }

   public getWidth(): number {
      return this.position ? this.position.width : -1;
   }
}

/**
 * Represents a column in a form list.
 *
 * ```typescript
 * import { ListColumn } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class ListColumn extends FormControl {
   public index: number;

   constructor() {
      super(ControlType.listColumn);
   }

   /**
    * Gets or sets the full 6 character column name. The Name property gets the short 4 character column name.
    */
   public fullName: string;
   public columnType: string;
   public category: string;

   public header: string;
   public toolTip: string;
   public positionField: FormControl;
   public width: number;

   public isRight: boolean;

   public maxLength: number;
   public maxDecimals: number;
   public isUpperCase: boolean;

   public aggregate: number;
   public aggregateDisplayRule: number;
   public aggregateUpdateRule: number;

   /**
    * Gets a value that indicates if the list column is numeric.
    */
   public isNumeric(): boolean {
      return (
         (this.constraint != null && this.constraint.isNumeric) ||
         (this.columnType != null &&
            (this.columnType === "S" || this.columnType === "P"))
      );
   }

   /**
    * Gets a values that indicates if the list column is a date.
    */
   public isDate(): boolean {
      return XmlNames.categoryDate === this.category;
   }

   /**
    * Gets a values that indicates if the list column is boolean.
    */
   public isBool(): boolean {
      return XmlNames.categoryBool === this.category;
   }
}

/**
 * Represents a list row.
 *
 * ```typescript
 * import { ListRow } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class ListRow {
   public name: string;
   public columnCount: number;
   public isSelected: boolean;
   public isProtected: boolean;
   public index: number;
   public items: any[];
   public subItems: any[];
}

/**
 * Represents a list cell.
 *
 * ```typescript
 * import { ListCell } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class ListCell {
   public name: string;
   public text: string;
   public isEnabled: boolean;
   public isEditable: boolean;
   public isHidden: boolean;
   public isChecked: boolean;
   public isBool: boolean;
   public isUpper: boolean;
   public isRight: boolean;
   public isReverse: boolean;
   public isHighIntensity: boolean;
   public maxLength: number;
   public minWidth: number;
   public span: number;
}

/**
 * List control.
 *
 * ```typescript
 * import { List } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class List extends FormControl {
   public columns: ListColumn[] = [];
   public subColumns: ListColumn[];
   public items: ListRow[] = [];
   public hasSubRows: boolean;
   public isCleared: boolean;
   public isScrollToEnd: boolean;
   public isEnd: boolean;
   public scroll: number;
   public isAggregate: boolean;
   public aggregateDepth: number;

   constructor() {
      super(ControlType.list);
   }
}

/**
 * TextBox control.
 *
 * ```typescript
 * import { TextBox } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class TextBox extends FormControl {
   public isReverse: boolean;
   public isHighIntensity: boolean;
   public isRightAligned: boolean;
   public isBrowsable: boolean;
   public isFixedFont: boolean;

   /**
    * Gets a values that indicates if the element is a list position field.
    */
   public isPosition: boolean;

   constructor(type: number = ControlType.textBox) {
      super(type);
   }

   /**
    * Gets a value that indicates if the TextBox is numeric.
    */
   public isNumeric(): boolean {
      const constraint = this.constraint;
      return constraint && constraint.isNumeric;
   }
}

/**
 * Label control.
 *
 * ```typescript
 * import { Label } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class Label extends FormControl {
   public id: string;
   public toolTip: string;
   public isFixed: boolean;
   public isAdditionalInfo: boolean;
   public isEmphasized: boolean;
   public isColon: boolean;

   constructor() {
      super(ControlType.label);
   }
}

/**
 * Button control.
 *
 * ```typescript
 * import { Button } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class Button extends FormControl {
   public command: string;
   public commandValue: string;
   public progId: string;
   public arguments: string;

   constructor() {
      super(ControlType.button);
   }
}

/**
 * GroupBox control.
 *
 * ```typescript
 * import { GroupBox } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class GroupBox extends FormControl {
   public isLine: boolean;
   constructor() {
      super(ControlType.groupBox);
   }
}

/**
 * CheckBox control.
 *
 * ```typescript
 * import { CheckBox } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class CheckBox extends FormControl {
   /**
    * Gets or sets a value that indicates if the CheckBox is checked or not.
    * IN M3 checked value is represented by 1 and an unchecked value by 0.
    */
   public isChecked: boolean;

   constructor() {
      super(ControlType.checkBox);
   }
}

/**
 * Represents an item in a ComboBox.
 *
 * ```typescript
 * import { ComboBoxItem } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class ComboBoxItem {
   public name: string;
   public value: string;
   public text: string;
   public isSelected: boolean;
}

/**
 * ComboBox control.
 *
 * ```typescript
 * import { ComboBox } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class ComboBox extends FormControl {
   public selected: ComboBoxItem;
   public command: string;
   public commandValue: string;
   public isEditable: boolean;

   /**
    * Gets a values that indicates if the element is a list position field.
    */
   public isPosition: boolean;

   public items: ComboBoxItem[] = [];

   constructor() {
      super(ControlType.comboBox);
   }
}

/**
 * DatePicker control.
 *
 * ```typescript
 * import { DatePicker } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class DatePicker extends TextBox {
   constructor(public dateFormat: string, public hideDateFormat: boolean) {
      super(ControlType.datePicker);
   }
}

/**
 * Represents a function key.
 *
 * ```typescript
 * import { FunctionKey } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class FunctionKey {
   public key: string;
   public text: string;
   public isReverse: boolean;
}

/**
 * Represents a basic or a related option.
 *
 * ```typescript
 * import { Option } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class Option {
   public value: string;
   public text: string;
}

/**
 * Represents a panel in an interactive M3 program.
 *
 * ```typescript
 * import { Panel } from '@infor-up/m3-odin';
 * ```
 *
 * @since 2.0.0
 */
export class Panel {
   public name: string;
   public header: string;
   public description: string;

   public informationCategory: string;
   public hideCommandBar: boolean;

   public sortingOrderComboBox: ComboBox;
   public sortingOrderTextBox: TextBox;
   public viewComboBox: ComboBox;
   public viewTextBox: TextBox;

   public controls: any = {};
   public controlList: FormControl[] = [];

   public basicOptions: Option[];
   public relatedOptions: Option[];

   public list: List;
   public panelSequence?: string;

   /**
    * Gets a value from the panel.
    *
    * @param name The name of the control.
    * @param defaultValue Optional default value to return if the value cannot be found.
    * @returns The value or the default value.
    */
   getValue(name: string, defaultValue?: string): string {
      const control = this.controls[name];
      return control ? control.value : defaultValue;
   }

   /**
    * Gets a control on the panel.
    *
    * @param name The name of the control.
    * @returns The control or null if the control cannot be found.
    */
   getControl(name: string): FormControl {
      return this.controls[name] as FormControl;
   }

   /**
    * Gets one or more controls on a panel.
    *
    * @param names The names of the controls.
    * @returns A control array or an empty array no controls can be found.
    */
   getControls(names: string[]): FormControl[] {
      const controls = [];
      for (const name of names) {
         const control = this.getControl(name);
         if (control) {
            controls.push(control);
         }
      }
      return controls;
   }

   /**
    * Gets a control info for a control on the panel.
    *
    * @param name The name of the control.
    * @returns The control info or null if the control cannot be found.
    */
   getControlInfo(name: string): IFormControlInfo {
      const control = this.getControl(name);
      if (control) {
         return {
            control: control,
            label: this.findControlLabel(this.controlList, control),
            additionalInfo: this.findAdditionalInfo(this.controlList, control),
         };
      }
      return null;
   }

   /**
    * Gets one or more controls infos for controls on a panel.
    *
    * @param names The names of the controls.
    * @returns A control info array or an empty array no controls can be found.
    */
   getControlInfos(names: string[]): IFormControlInfo[] {
      const controls = [];
      for (const name of names) {
         const control = this.getControlInfo(name);
         if (control) {
            controls.push(control);
         }
      }
      return controls;
   }

   private findControlLabel(
      elements: FormControl[],
      control: FormControl
   ): Label {
      const left = control.getLeft();
      let top = control.getTop();
      let label: Label;
      let i: number;

      // First try to find a label to the left of the control.
      for (i = 0; i < elements.length; i++) {
         label = <Label>elements[i];
         if (label.type === ControlType.label && label.getTop() === top) {
            const labelLeft = label.getLeft();
            if (labelLeft < left) {
               const labelWidth = label.getWidth();
               const distance = left - labelLeft - labelWidth;
               if (distance < 5) {
                  // 5 is an arbitrary number that works in most cases
                  return label;
               }
            }
         }
      }

      // If no label is found try to find a label directly above the field
      top--;
      if (top <= 0) {
         return null;
      }

      for (i = 0; i < elements.length; i++) {
         label = <Label>elements[i];
         if (label.type === ControlType.label && label.getTop() === top) {
            if (label.getLeft() === left) {
               if (!label.isAdditionalInfo) {
                  // Only regular labels are OK, not additional info labels.
                  return label;
               }
               return null;
            }
         }
      }

      return null;
   }

   private findAdditionalInfo(
      elements: FormControl[],
      control: FormControl
   ): Label {
      const left = control.getLeft() + control.getWidth();
      const top = control.getTop();

      // Find a matching label with the isAdditionalInfo property set to true
      for (let i = 0; i < elements.length; i++) {
         const label = <Label>elements[i];
         if (label.isAdditionalInfo) {
            const labelTop = label.getTop();
            if (labelTop === top) {
               const labelLeft = label.getLeft();
               if (labelLeft >= left && labelLeft <= left + 2) {
                  return label;
               }
            }
         }
      }

      return null;
   }
}

/**
 * Represents a control on a panel with it's label and additional information label.
 * ```typescript
 * import { IFormControlInfo } from '@infor-up/m3-odin';
 * ```
 * Note that a label and additional info label will not be available for all controls.
 *
 * @since 2.0.0
 */
export interface IFormControlInfo {
   control?: FormControl;
   label?: Label;
   additionalInfo: Label;
}
