import { defaultDataTable } from "./data";

export function DataTable({ data = defaultDataTable }) {
  return (
    <table className="ui-table">
      <thead>
        <tr>
          {data.columns.map((col) => (
            <th key={col}>{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row) => (
          <tr key={row[0]}>
            {row.map((cell, index) => (
              <td key={`${cell}-${index}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
