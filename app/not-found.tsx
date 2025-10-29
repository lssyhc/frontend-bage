export default function NotFound() {
    return (
        <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 p-4 text-center">
            <div className="flex flex-col items-center gap-2">
                <span className="text-2xl font-bold tracking-tight">
                    Halaman tidak ditemukan
                </span>
                <span className="text-muted-foreground">
                    Halaman yang Anda cari tidak ada atau telah dipindahkan
                </span>
            </div>
        </div>
    );
}
