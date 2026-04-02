{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = with pkgs; [
    # Frontend
    nodejs
    nodePackages.npm

    # Backend
    python3
    python3Packages.fastapi
    python3Packages.uvicorn
    python3Packages.sqlalchemy
    python3Packages.psycopg2
    python3Packages.pydantic
    python3Packages.passlib
    python3Packages.bcrypt
    python3Packages.python-jose
    python3Packages.multipart
  ];
}
