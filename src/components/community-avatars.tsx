const CommunityAvatars = () => {
  // 使用 picsum.photos 的真实人物头像 ID（1~1000）
  const avatarIds = [1027, 1035, 1048, 1052, 1067, 1075];

  return (
    <div className="flex w-full h-full flex-col items-center justify-center bg-gray-900 p-4">
      <div className="relative w-full h-full mx-auto">
        {/* 中心大头像 */}
        <img
          src="https://picsum.photos/id/1027/400/400"
          alt="Center"
          className="w-16 h-16 absolute inset-0 rounded-full object-cover border-4 border-[#111829] shadow-xl hover:scale-105 transition-transform duration-300"
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* 周围小头像 */}
        {avatarIds.slice(1).map((id, index) => {
          const positions = [
            { left: '20%', top: '20%', width: '46px', height: '46px' },
            { right: '5%', top: '10%', width: '48px', height: '48px' },
            { right: '10%', bottom: '20%', width: '32px', height: '32px' },
            { left: '20%', bottom: '20%', width: '20px', height: '20px' },
            { left: '50%', top: '15%', width: '36px', height: '36px' },
            { right: '4%', top: '80%', width: '40px', height: '40px' },
          ];

          return (
            <img
              key={id}
              src={`https://picsum.photos/id/${id}/200/200`}
              alt={`User ${id}`}
              className={`absolute rounded-full object-cover border-2 border-[#111829] shadow-md hover:shadow-lg transition-shadow duration-300`}
              style={{
                ...positions[index],
                transform: 'translate(-50%, -50%)',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CommunityAvatars;
