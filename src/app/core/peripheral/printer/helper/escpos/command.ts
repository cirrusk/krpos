export class Command {


  public static ESC        = 0x1B;
  public static FF         = 0x0C;
  public static FS         = 0x1C;
  public static GS         = 0x1D;
  public static DC1        = 0x11;
  public static DC4        = 0x14;
  public static DLE        = 0x10;
  public static NL         = 0x0A;
  public static SP         = 0x20;
  public static US         = 0x1F;
  public static CR         = 0x0D;

  public static DLE_EOT            = (n: number): number[] => [Command.DLE, 0x04, n]; // DLEEOTn

  public static ESC_init: number[] = [Command.ESC, 0x40]; // ESC@
  public static ESC_exclamation    = (n: number): number[] => [Command.ESC, 0x21, n]; // ESC!n
  public static ESC_minus          = (n: number): number[] => [Command.ESC, 0x2D, n]; // ESC-n
  public static ESC_rev            = (n: number): number[] => [Command.ESC, 0x7B, n]; // ESC{n
  public static ESC_a              = (n: number): number[] => [Command.ESC, 0x61, n]; // ESCan
  public static ESC_d              = (n: number): number[] => [Command.ESC, 0x64, n]; // ESCdn
  public static ESC_E              = (n: number): number[] => [Command.ESC, 0x45, n]; // ESCEn
  public static ESC_G              = (n: number): number[] => [Command.ESC, 0x47, n]; // ESCGn
  public static ESC_J              = (n: number): number[] => [Command.ESC, 0x4A, n]; // ESCJn
  public static ESC_M              = (n: number): number[] => [Command.ESC, 0x4D, n]; // ESCMn
  public static ESC_t              = (n: number): number[] => [Command.ESC, 0x07, n]; // ESCtn
  public static ESC_Z              = (m: number, n: number, k: number): number[] => [Command.ESC, 0x5A, m, n, k]; // ESCZmnk
  public static ESC_p              = (n: number): number[] => [Command.ESC, 0x70, n]; // ESCpn

  public static FS_and: number[]   = [Command.FS, 0x40]; // ESC@

  public static GS_exclamation     = (n: number): number[] => [Command.GS, 0x21, n]; // ESC!n
  public static GS_B               = (n: number): number[] => [Command.GS, 0x42, n]; // GSBn
  public static GS_f               = (n: number): number[] => [Command.GS, 0x66, n]; // GSfn
  public static GS_h               = (n: number): number[] => [Command.GS, 0x68, n]; // GShn
  public static GS_H               = (n: number): number[] => [Command.GS, 0x48, n]; // GSHn
  public static GS_K               = (m: number, n: number): number[] => [Command.GS, 0x6B, m, n]; // GSKmn
  public static GS_v0              = (m: number): number[] => [Command.GS, 0x76, 0x30, m]; // GSv0m
  public static GS_w               = (n: number): number[] => [Command.GS, 0x77, n]; // GSwn
  public static GS_x               = (n: number): number[] => [Command.GS, 0x78, n]; // GSxn
  public static GS_V               = (n: number): number[] => [Command.GS, 0x56, n]; // GSVn

  public static LF: number[]       = [Command.CR, Command.NL];

  public static FS_p               = (n: number): number[] => [Command.FS, 0x70, n, 0x00]; // FSpn

  public static SO         = 0x0E; // Shiftout
}
