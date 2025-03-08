/*---------------------------------------------------------------------------------------------
 *  Copyright (c) MNovus. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ReactComponent as GitFileIcon } from "../assets/files/git.svg";
import { ReactComponent as HTMLFileIcon } from "../assets/files/html.svg";
import { ReactComponent as CSSFileIcon } from "../assets/files/css.svg";
import { ReactComponent as JSFileIcon } from "../assets/files/javascript.svg";
import { ReactComponent as JSONFileIcon } from "../assets/files/json.svg";
import { ReactComponent as MarkdownFileIcon } from "../assets/files/markdown.svg";
import { ReactComponent as TSFileIcon } from "../assets/files/ts-1.svg";
import { ReactComponent as TTFFileIcon } from "../assets/files/ttf.svg";
import { ReactComponent as SVGFileIcon } from "../assets/files/svg.svg";
import { ReactComponent as PythonFileIcon } from "../assets/files/python.svg";
import { ReactComponent as UnknownFileIcon } from "../assets/files/unknown.svg";
import { ReactComponent as ExcelFileIcon } from "../assets/files/excel.svg";
import { ReactComponent as CSVFileIcon } from "../assets/files/csv.svg";
import { ReactComponent as SettingsIcon } from "../assets/files/settings.svg";
import { ReactComponent as StudioIcon } from "../assets/files/remote.svg";

const FileIcon = ({ type }: { type: string }) => {
  const typeIcon = {
    gitignore: GitFileIcon,
    html: HTMLFileIcon,
    css: CSSFileIcon,
    js: JSFileIcon,
    jsx: JSFileIcon,
    json: JSONFileIcon,
    md: MarkdownFileIcon,
    ts: TSFileIcon,
    tsx: TSFileIcon,
    ttf: TTFFileIcon,
    svg: SVGFileIcon,
    py: PythonFileIcon,
    unknown: UnknownFileIcon,
    excel: ExcelFileIcon,
    csv: CSVFileIcon,
    settings: SettingsIcon,
    Studio: StudioIcon,
  };

  const IconComponent =
    typeIcon[type as keyof typeof typeIcon] || typeIcon["unknown"];
  return <IconComponent />;
};

export default FileIcon;
