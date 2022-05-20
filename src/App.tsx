import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function App() {
  const [searchParams, setSearchParams] = useSearchParams();
  const date = searchParams.get("date") ?? "";

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        <span role="img" aria-label="Date">
          📅
        </span>
        <span role="img" aria-label="Time">
          ⌚
        </span>
        &nbsp;
        {"Intl.DateTimeFormat() Playground"}
      </h1>

      <p className="mb-4">
        Read the{" "}
        <a
          className="text-blue-500 font-semibold"
          href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#parameters"
          target="_blank"
          rel="noreferrer"
        >
          docs
        </a>
        !
      </p>

      <div className="flex flex-col gap-4">
        <label className="block">
          <FormLabel>Date</FormLabel>
          <input
            className="block w-full mt-1"
            type="datetime-local"
            value={date}
            onChange={(e) => {
              if (!e.target.value) {
                setSearchParams({}, { replace: true });
              } else {
                const { date: currentDate, ...restParams } =
                  Object.fromEntries(searchParams);

                setSearchParams({
                  date: e.target.value,
                  ...restParams,
                });
              }
            }}
          />
        </label>

        {date ? <Output dateString={date} /> : null}
      </div>
    </div>
  );
}

function Output({ dateString }: { dateString: string }) {
  const date = useMemo(() => new Date(dateString), [dateString]);

  const [searchParams, setSearchParams] = useSearchParams();
  const {
    dateStyle = "",
    timeStyle = "",
    hour12 = "",
    timeZone = "",
    weekday = "",
    era = "",
    year = "",
    month = "",
    day = "",
    hour = "",
    minute = "",
    second = "",
    fractionalSecondDigits = "",
    timeZoneName = "",
  } = Object.fromEntries(searchParams);

  // TODO: allow changing locale
  const [locale] = useState(
    () => new Intl.DateTimeFormat().resolvedOptions().locale
  );

  const options = useMemo(() => {
    if (dateStyle || timeStyle) {
      return {
        ...(dateStyle && { dateStyle }),
        ...(timeStyle && { timeStyle }),
        ...(timeZone && { timeZone }),
        ...(hour12 && { hour12: hour12 === "true" }),
      };
    }

    return {
      ...(timeZone && { timeZone }),
      ...(hour12 && { hour12: hour12 === "true" }),
      ...(weekday && { weekday }),
      ...(era && { era }),
      ...(year && { year }),
      ...(month && { month }),
      ...(day && { day }),
      ...(hour && { hour }),
      ...(minute && { minute }),
      ...(second && { second }),
      ...(fractionalSecondDigits && {
        fractionalSecondDigits: Number(fractionalSecondDigits),
      }),
      ...(timeZoneName && { timeZoneName }),
    };
  }, [
    dateStyle,
    timeStyle,
    timeZone,
    hour12,
    weekday,
    era,
    year,
    month,
    day,
    hour,
    minute,
    second,
    fractionalSecondDigits,
    timeZoneName,
  ]);

  const formattedDate = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(locale, options).format(date);
    } catch {
      return "";
    }
  }, [date, options, locale]);

  const timeZonesRef = useRef<string[] | null>(null);

  const timeZones = (() => {
    if (timeZonesRef.current === null) {
      timeZonesRef.current = Intl.supportedValuesOf("timeZone") as string[];
    }

    return timeZonesRef.current;
  })();

  const parameters: Array<[paramName: string, options: string[]]> = [
    ["dateStyle", ["full", "long", "medium", "short"]],
    ["timeStyle", ["full", "long", "medium", "short"]],
    ["hour12", ["true", "false"]],
    ["timeZone", timeZones],
    ["weekday", ["long", "short", "narrow"]],
    ["era", ["long", "short", "narrow"]],
    ["year", ["numeric", "2-digit"]],
    ["month", ["numeric", "2-digit", "long", "short", "narrow"]],
    ["day", ["numeric", "2-digit"]],
    ["hour", ["numeric", "2-digit"]],
    ["minute", ["numeric", "2-digit"]],
    ["second", ["numeric", "2-digit"]],
    ["fractionalSecondDigits", ["1", "2", "3"]],
    [
      "timeZoneName",
      [
        "long",
        "short",
        "shortOffset",
        "longOffset",
        "shortGeneric",
        "longGeneric",
      ],
    ],
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {parameters.map(([paramName, options]) => (
          <ParamSelect
            key={paramName}
            paramName={paramName}
            options={options}
          />
        ))}
      </div>

      <button
        className="py-2 bg-red-300 rounded"
        onClick={() => {
          setSearchParams({
            date: dateString,
          });
        }}
      >
        Reset
      </button>

      <pre className="block p-4 bg-gray-100 rounded-lg shadow">{`new Intl.DateTimeFormat("${locale}", ${JSON.stringify(
        options,
        null,
        2
      )}).format(date)`}</pre>

      <span className="font-bold text-lg">{formattedDate}</span>
    </>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-gray-800 font-bold">{children}</span>;
}

function ParamSelect({
  paramName,
  options,
}: {
  paramName: string;
  options: string[];
}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const { [paramName]: currentValue = "", ...restParams } =
    Object.fromEntries(searchParams);

  return (
    <label className="block">
      <FormLabel>{paramName}</FormLabel>
      <select
        className="block w-full mt-1"
        value={currentValue}
        onChange={(e) => {
          setSearchParams({
            ...restParams,
            ...(e.target.value && {
              [paramName]: e.target.value,
            }),
          });
        }}
      >
        <option value="">--</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
