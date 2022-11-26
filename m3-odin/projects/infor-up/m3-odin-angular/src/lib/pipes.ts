import { Pipe, PipeTransform } from "@angular/core";
import { FormatUtil } from "@infor-up/m3-odin";

/**
 * Converts M3 dates to JavaScript Date objects.
 *
 * ```
 * {{ value_expression | m3date [ : operation ] }}
 * ```
 *
 * Input value: An M3 date string on the current users date format.
 *
 * Operations: 'fromString' - converts from a short M3 date string on the current users format.
 *
 * **Example**
 *
 * This example uses the m3Date pipe to convert an M3 date string to a Date and then formats it to a specific
 * format using the Angular date pipe.
 * ```
 * <p>M3 date string pipe conversion: {{shortDateString | m3date:'fromString' | date:'yyyy-MM-dd' }}</p>
 * ```
 *
 * @since 2.0.0
 */
@Pipe({ name: "m3date" })
export class DatePipe implements PipeTransform {
   transform(value: any, type: string): any {
      if (type === "fromString") {
         return FormatUtil.parseDate(value);
      }
      return value;
   }
}
