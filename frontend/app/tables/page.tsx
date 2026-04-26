"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Table as TableIcon, Columns, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react"

interface TableInfo {
    name: string
    tableName: string
    schema: string
}

interface ColumnInfo {
    name: string
    columnName: string
    clrType: string
    dbType: string | null
    nullable: boolean
    isPrimaryKey: boolean
    isForeignKey: boolean
    maxLength: number | null
}

interface TableSchema {
    table: string
    entityName: string
    columns: ColumnInfo[]
}

interface TableData {
    table: string
    totalCount: number
    page: number
    pageSize: number
    totalPages: number
    rows: Record<string, unknown>[]
}

export default function TablesPage() {
    const [tables, setTables] = useState<TableInfo[]>([])
    const [selectedTable, setSelectedTable] = useState<string | null>(null)
    const [schema, setSchema] = useState<TableSchema | null>(null)
    const [data, setData] = useState<TableData | null>(null)
    const [loading, setLoading] = useState(true)
    const [dataLoading, setDataLoading] = useState(false)
    const [activeTab, setActiveTab] = useState("schema")
    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        fetchTables()
    }, [])

    useEffect(() => {
        if (selectedTable) {
            fetchSchema(selectedTable)
            fetchData(selectedTable, 1)
            setCurrentPage(1)
        }
    }, [selectedTable])

    const fetchTables = async () => {
        try {
            const res = await fetch("/api/schema/tables")
            const data = await res.json()
            setTables(data)
            if (data.length > 0 && !selectedTable) {
                setSelectedTable(data[0].name)
            }
        } catch (error) {
            console.error("Failed to fetch tables:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchSchema = async (table: string) => {
        try {
            const res = await fetch(`/api/schema/${table}`)
            const data = await res.json()
            setSchema(data)
        } catch (error) {
            console.error("Failed to fetch schema:", error)
        }
    }

    const fetchData = async (table: string, page: number) => {
        setDataLoading(true)
        try {
            const res = await fetch(`/api/schema/${table}/data?page=${page}&pageSize=20`)
            const result = await res.json()
            setData(result)
        } catch (error) {
            console.error("Failed to fetch data:", error)
        } finally {
            setDataLoading(false)
        }
    }

    const handlePageChange = (newPage: number) => {
        if (selectedTable && newPage >= 1 && newPage <= (data?.totalPages || 1)) {
            setCurrentPage(newPage)
            fetchData(selectedTable, newPage)
        }
    }

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            "String": "bg-green-600",
            "Int32": "bg-blue-600",
            "Int64": "bg-blue-700",
            "Decimal": "bg-purple-600",
            "DateTime": "bg-orange-600",
            "Boolean": "bg-yellow-600",
            "Guid": "bg-pink-600",
        }
        return colors[type] || "bg-slate-600"
    }

    const formatValue = (value: unknown): string => {
        if (value === null || value === undefined) return "NULL"
        if (typeof value === "object") {
            if (value instanceof Date) return new Date(value).toLocaleString()
            return JSON.stringify(value)
        }
        return String(value)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900">
                <div className="text-slate-400">Loading tables...</div>
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-slate-900">
            {/* Sidebar - Table List */}
            <div className="w-64 border-r border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        Database Tables
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {tables.map((table) => (
                        <button
                            key={table.name}
                            onClick={() => setSelectedTable(table.name)}
                            className={`w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-slate-800 transition-colors ${selectedTable === table.name ? "bg-slate-800 border-l-2 border-blue-500" : ""
                                }`}
                        >
                            <TableIcon className="h-4 w-4 text-slate-400" />
                            <div className="flex-1 min-w-0">
                                <div className="text-slate-200 truncate">{table.name}</div>
                                <div className="text-xs text-slate-500">{table.schema}.{table.tableName}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {selectedTable && schema ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-semibold text-slate-100">{schema.entityName}</h1>
                                <p className="text-sm text-slate-400">Table: {schema.table}</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                    fetchSchema(selectedTable)
                                    fetchData(selectedTable, currentPage)
                                }}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Refresh
                            </Button>
                        </div>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-4 border-b border-slate-700">
                                <TabsList className="bg-slate-800">
                                    <TabsTrigger value="schema" className="gap-2 data-[state=active]:bg-slate-700">
                                        <Columns className="h-4 w-4" />
                                        Schema
                                    </TabsTrigger>
                                    <TabsTrigger value="data" className="gap-2 data-[state=active]:bg-slate-700">
                                        <TableIcon className="h-4 w-4" />
                                        Data {data && `(${data.totalCount})`}
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Schema Tab */}
                            <TabsContent value="schema" className="flex-1 overflow-auto p-4 m-0">
                                <Card className="bg-slate-800 border-slate-700">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-700 hover:bg-slate-800">
                                                <TableHead className="text-slate-300">Column</TableHead>
                                                <TableHead className="text-slate-300">DB Column</TableHead>
                                                <TableHead className="text-slate-300">Type</TableHead>
                                                <TableHead className="text-slate-300">DB Type</TableHead>
                                                <TableHead className="text-slate-300">Nullable</TableHead>
                                                <TableHead className="text-slate-300">Max Length</TableHead>
                                                <TableHead className="text-slate-300">Keys</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {schema.columns.map((col) => (
                                                <TableRow key={col.name} className="border-slate-700 hover:bg-slate-700/50">
                                                    <TableCell className="font-medium text-slate-200">{col.name}</TableCell>
                                                    <TableCell className="text-slate-400">{col.columnName}</TableCell>
                                                    <TableCell>
                                                        <Badge className={`${getTypeColor(col.clrType)} text-white`}>
                                                            {col.clrType}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-400 text-xs font-mono">
                                                        {col.dbType || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={col.nullable ? "secondary" : "outline"} className="text-xs">
                                                            {col.nullable ? "Yes" : "No"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-slate-400">
                                                        {col.maxLength || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex gap-1">
                                                            {col.isPrimaryKey && (
                                                                <Badge className="bg-amber-600 text-white text-xs">PK</Badge>
                                                            )}
                                                            {col.isForeignKey && (
                                                                <Badge className="bg-cyan-600 text-white text-xs">FK</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </TabsContent>

                            {/* Data Tab */}
                            <TabsContent value="data" className="flex-1 flex flex-col overflow-hidden p-4 m-0">
                                <Card className="bg-slate-800 border-slate-700 flex-1 flex flex-col overflow-hidden">
                                    <div className="flex-1 overflow-auto">
                                        {dataLoading ? (
                                            <div className="flex items-center justify-center h-full text-slate-400">
                                                Loading data...
                                            </div>
                                        ) : data && data.rows.length > 0 ? (
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-slate-700 hover:bg-slate-800">
                                                        {schema.columns.map((col) => (
                                                            <TableHead key={col.name} className="text-slate-300 whitespace-nowrap">
                                                                {col.name}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {data.rows.map((row, idx) => (
                                                        <TableRow key={idx} className="border-slate-700 hover:bg-slate-700/50">
                                                            {schema.columns.map((col) => (
                                                                <TableCell key={col.name} className="text-slate-300 max-w-xs truncate">
                                                                    {formatValue(row[col.name])}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400">
                                                No data found
                                            </div>
                                        )}
                                    </div>

                                    {/* Pagination */}
                                    {data && data.totalPages > 1 && (
                                        <div className="flex items-center justify-between p-4 border-t border-slate-700">
                                            <div className="text-sm text-slate-400">
                                                Page {data.page} of {data.totalPages} ({data.totalCount} rows)
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage - 1)}
                                                    disabled={currentPage <= 1}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handlePageChange(currentPage + 1)}
                                                    disabled={currentPage >= data.totalPages}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        Select a table to view its schema
                    </div>
                )}
            </div>
        </div>
    )
}
