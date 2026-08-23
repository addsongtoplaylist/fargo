type Traveller = {
  name: string;
  avatar: string | null;
};

export function TravellerAvatars({
  travellers,
  size = 26,
}: {
  travellers: Traveller[];
  size?: number;
}) {
  return (
    <div className="flex items-center" style={{ gap: `-6px` }}>
      {travellers.map((t, i) => (
        <div
          key={i}
          className="rounded-full bg-white/30 border-2 border-white/40 flex items-center justify-center text-white font-medium shrink-0"
          style={{
            width: size,
            height: size,
            fontSize: size * 0.4,
            marginLeft: i > 0 ? -6 : 0,
          }}
          title={t.name}
        >
          {t.name[0]}
        </div>
      ))}
    </div>
  );
}
