import { Transaction } from "../../interface";
import { Checkbox } from "../checkbox";
import { Ignorebutton } from "../ignore-payment";

const headers = ["isSplit", "Date", "Name", "Amount", "Account", "Ignore"] as const;

export type GetArrayElement<T extends readonly any[]> = T extends readonly (infer U)[] ? U : never;

export type Header = GetArrayElement<typeof headers>;

type Row = Transaction & { isSplit: boolean };
interface Props {
  rows: Row[];
}

const CellValue = ({ header, row }: { header: Header; row: Row }) => {
  if (header === "isSplit") return <Checkbox id={row.id} isSplit={row.isSplit} />;
  if (header === "Name") return <>{`${row.isPending ? "⏳" : ""} ${row.Name}`}</>;
  if (header === "Ignore")
    return (
      <Ignorebutton
        // TODO find a better way to get the bank name
        bankName={row.Account.split(" ")[0].toLowerCase()}
        paymentId={row.id}
      />
    );
  return <>{row[header]}</>;
};

export const Table = ({ rows }: Props) => (
  <table style={{ border: "1px solid", borderCollapse: "collapse" }}>
    <thead>
      <tr>
        {headers.map((h) => (
          <th style={{ border: "1px solid", padding: "5px" }} scope="col">
            {h}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map((row) => (
        <tr>
          {headers.map((header) => {
            if (row.id === "0" || row.id === "1") {
              const relevantHeaders = ["Name", "Amount"];
              if (relevantHeaders.includes(header))
                return (
                  <td style={{ border: "1px solid black", padding: "5px" }}>
                    <b>{row[header as "Name" | "Amount"]}</b>
                  </td>
                );
              else return <td></td>;
            }
            return (
              <td style={{ border: "1px solid black", padding: "5px" }}>
                <CellValue header={header} row={row} />
              </td>
            );
          })}
        </tr>
      ))}
    </tbody>
  </table>
);
