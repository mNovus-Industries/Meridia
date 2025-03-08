import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
  createTableColumn,
} from "@fluentui/react-components";
import { useAppSelector } from "../../../helpers/hooks";
import "./style.css";

export const VariableSection = () => {
  const vars = useAppSelector((state) => state.main.env_vars);

  // Convert vars object to an array for the table
  const items = Object.entries(vars).map(([key, value]) => ({
    name: key,
    value: value,
  }));

  const columns = [
    createTableColumn({
      columnId: "name",
      renderHeaderCell: () => <>Name</>,
      renderCell: (item: any) => <TableCell>{item.name}</TableCell>,
    }),
    createTableColumn({
      columnId: "value",
      renderHeaderCell: () => <>Value</>,
      renderCell: (item: any) => <TableCell>{item.value}</TableCell>,
    }),
  ];

  return (
    <div className="variable-wrapper">
      <p className="variable-title">VARIABLES</p>
      <div className="table-container">
        <Table className="styled-table">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHeaderCell key={column.columnId} className="table-header">
                  {column.renderHeaderCell()}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item, index) => (
              <TableRow
                key={item.name}
                className={index % 2 === 0 ? "table-row even" : "table-row odd"}
              >
                {columns.map((column) => (
                  <TableCell key={column.columnId} className="table-cell">
                    {column.renderCell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
